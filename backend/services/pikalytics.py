"""Pulls current-regulation usage data from Pikalytics.

The /ai/pokedex endpoint without a format code always serves whatever
regulation is current, so the site follows regulation rollovers on its own.
Pikalytics publishes these endpoints for automated clients in robots.txt and
llms.txt; the markdown shape below is the documented one.
"""

import re
import time
from dataclasses import dataclass, asdict, field
from typing import Dict, List, Optional

import httpx

SOURCE_URL = "https://www.pikalytics.com/ai/pokedex"
USER_AGENT = "PokeChat-VGC-Coach/1.0 (+https://github.com/SamirVarma01; VGC team analysis)"
CACHE_TTL_SECONDS = 6 * 60 * 60
DETAIL_CACHE_TTL_SECONDS = 24 * 60 * 60


@dataclass
class PokemonUsage:
    name: str
    usage: float
    rank: int
    win_rate: Optional[float] = None
    record: Optional[str] = None


@dataclass
class TeamCore:
    members: List[str]
    teams: int
    usage: float


@dataclass
class MetaSnapshot:
    format_name: str
    format_code: str
    game: str
    data_date: str
    pokemon: List[PokemonUsage] = field(default_factory=list)
    cores: List[TeamCore] = field(default_factory=list)
    fetched_at: float = 0.0

    def to_dict(self) -> Dict:
        return {
            "format": {
                "name": self.format_name,
                "code": self.format_code,
                "game": self.game,
                "data_date": self.data_date,
            },
            "pokemon": [asdict(p) for p in self.pokemon],
            "cores": [asdict(c) for c in self.cores],
            "fetched_at": self.fetched_at,
            "source_url": SOURCE_URL,
        }


@dataclass
class PokemonDetail:
    name: str
    weaknesses: List[str] = field(default_factory=list)
    resistances: List[str] = field(default_factory=list)
    immunities: List[str] = field(default_factory=list)
    base_stats: Dict[str, int] = field(default_factory=dict)
    common_moves: List[str] = field(default_factory=list)

    @property
    def base_speed(self) -> Optional[int]:
        return self.base_stats.get("Speed")


_cache: Optional[MetaSnapshot] = None
_detail_cache: Dict[str, tuple] = {}


def _field(markdown: str, label: str) -> str:
    match = re.search(rf"^- \*\*{label}\*\*:\s*`?([^`\n]+?)`?\s*$", markdown, re.MULTILINE)
    return match.group(1).strip() if match else ""


def _section(markdown: str, heading: str) -> str:
    """Return the body between `heading` and the next heading of any level."""
    match = re.search(rf"^#{{2,3}} {re.escape(heading)}.*?$", markdown, re.MULTILINE)
    if not match:
        return ""
    rest = markdown[match.end():]
    next_heading = re.search(r"^#{2,3} ", rest, re.MULTILINE)
    return rest[: next_heading.start()] if next_heading else rest


def _to_float(text: str) -> Optional[float]:
    try:
        return float(text.strip().rstrip("%"))
    except (ValueError, AttributeError):
        return None


def _parse_usage(markdown: str) -> List[PokemonUsage]:
    section = _section(markdown, "Best 50 Pokemon by Usage")
    entries: List[PokemonUsage] = []

    for line in section.splitlines():
        line = line.strip()
        if not line.startswith("|"):
            continue
        cells = [cell.strip() for cell in line.strip("|").split("|")]
        if len(cells) < 3 or not cells[0].isdigit():
            continue

        usage = _to_float(cells[2])
        if usage is None:
            continue

        entries.append(
            PokemonUsage(
                name=cells[1].strip("*").strip(),
                usage=usage,
                rank=int(cells[0]),
                win_rate=_to_float(cells[3]) if len(cells) > 3 else None,
                record=cells[4] if len(cells) > 4 and re.fullmatch(r"\d+-\d+", cells[4]) else None,
            )
        )

    return entries


def _parse_cores(markdown: str) -> List[TeamCore]:
    section = _section(markdown, "2-Pokemon Cores")
    cores: List[TeamCore] = []

    for line in section.splitlines():
        line = line.strip()
        if not line.startswith("|"):
            continue
        cells = [cell.strip() for cell in line.strip("|").split("|")]
        if len(cells) < 4 or not cells[0].isdigit():
            continue

        usage = _to_float(cells[3])
        if usage is None:
            continue

        cores.append(
            TeamCore(
                members=[member.strip() for member in cells[1].split(",") if member.strip()],
                teams=int(cells[2]) if cells[2].isdigit() else 0,
                usage=usage,
            )
        )

    return cores


def parse_snapshot(markdown: str) -> MetaSnapshot:
    pokemon = _parse_usage(markdown)
    if not pokemon:
        raise ValueError("No usage rows found in the Pikalytics response")

    return MetaSnapshot(
        format_name=_field(markdown, "Format") or "Unknown format",
        format_code=_field(markdown, "Format Code"),
        game=_field(markdown, "Game"),
        data_date=_field(markdown, "Data Date"),
        pokemon=pokemon,
        cores=_parse_cores(markdown),
        fetched_at=time.time(),
    )


def _parse_type_list(cell: str) -> List[str]:
    """'Fire (2x), Ice (2x)' -> ['Fire', 'Ice']; 'None' -> []."""
    types = []
    for part in cell.split(","):
        name = re.sub(r"\(.*?\)", "", part).strip().strip("*")
        if name and name.lower() not in {"none", "no types"}:
            types.append(name)
    return types


def parse_detail(markdown: str, name: str) -> PokemonDetail:
    detail = PokemonDetail(name=name)

    matchups = _section(markdown, "Defensive Type Matchups")
    for line in matchups.splitlines():
        cells = [c.strip() for c in line.strip().strip("|").split("|")]
        if len(cells) < 2:
            continue
        label = cells[0].strip("*").lower()
        if "weak" in label:
            detail.weaknesses = _parse_type_list(cells[1])
        elif "resist" in label:
            detail.resistances = _parse_type_list(cells[1])
        elif "immune" in label:
            detail.immunities = _parse_type_list(cells[1])

    for move_match in re.finditer(r"^- \*\*(.+?)\*\*: [\d.]+%", _section(markdown, "Common Moves"), re.MULTILINE):
        detail.common_moves.append(move_match.group(1))

    stats_block = re.search(r"### What are the base stats for .+?\?\n(.*?)(?:\n\n|\n---)", markdown, re.DOTALL)
    if stats_block:
        for line in stats_block.group(1).splitlines():
            cells = [c.strip().strip("*") for c in line.strip().strip("|").split("|")]
            if len(cells) >= 2 and cells[1].isdigit():
                detail.base_stats[cells[0]] = int(cells[1])

    return detail


def get_pokemon_detail(name: str, format_code: str) -> Optional[PokemonDetail]:
    """Typing, base stats and common moves for one Pokemon, cached for a day."""
    key = f"{format_code}/{name}"
    cached = _detail_cache.get(key)
    if cached and (time.time() - cached[0]) < DETAIL_CACHE_TTL_SECONDS:
        return cached[1]

    try:
        response = httpx.get(
            f"{SOURCE_URL}/{format_code}/{name}",
            headers={"User-Agent": USER_AGENT, "Accept": "text/markdown, text/plain"},
            timeout=20.0,
            follow_redirects=True,
        )
        response.raise_for_status()
        detail = parse_detail(response.text, name)
        # A page that parses to nothing means the species name did not resolve.
        if not detail.base_stats and not detail.weaknesses:
            return None
        _detail_cache[key] = (time.time(), detail)
        return detail
    except Exception:
        return cached[1] if cached else None


def get_current_meta(force_refresh: bool = False) -> MetaSnapshot:
    """Current-regulation usage data, cached for CACHE_TTL_SECONDS.

    On a failed refresh a previously cached snapshot is returned rather than
    falling back to another regulation's numbers.
    """
    global _cache

    if not force_refresh and _cache and (time.time() - _cache.fetched_at) < CACHE_TTL_SECONDS:
        return _cache

    try:
        response = httpx.get(
            SOURCE_URL,
            headers={"User-Agent": USER_AGENT, "Accept": "text/markdown, text/plain"},
            timeout=20.0,
            follow_redirects=True,
        )
        response.raise_for_status()
        _cache = parse_snapshot(response.text)
        return _cache
    except Exception:
        if _cache:
            return _cache
        raise
