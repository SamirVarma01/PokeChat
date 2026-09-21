"""Rule-based team analysis.

Everything here is derived from the parsed team plus live Pikalytics data, so
it costs nothing to run and works with no API key. The LLM layer consumes this
as grounding rather than recalling the format from memory.
"""

from typing import Dict, List, Optional

from services.pikalytics import MetaSnapshot, PokemonDetail, get_pokemon_detail

META_SAMPLE_SIZE = 15
STACKED_WEAKNESS_MIN = 3

SPEED_CONTROL_MOVES = {"Tailwind", "Trick Room", "Icy Wind", "Thunder Wave", "Electroweb", "Bleakwind Storm"}
REDIRECTION_MOVES = {"Follow Me", "Rage Powder"}
DISRUPTION_MOVES = {"Fake Out", "Taunt", "Encore", "Spore", "Will-O-Wisp"}


def _strip_form(name: str) -> str:
    """'Salamence-Mega' -> 'Salamence'; Pikalytics indexes base species."""
    lowered = name.lower()
    for suffix in ("-mega-x", "-mega-y", "-mega"):
        if lowered.endswith(suffix):
            return name[: -len(suffix)]
    return name


def _lookup(name: str, format_code: str) -> Optional[PokemonDetail]:
    """Mega forms have their own pages with their own stats; fall back to the base species."""
    detail = get_pokemon_detail(name, format_code)
    if detail:
        return detail
    base = _strip_form(name)
    return get_pokemon_detail(base, format_code) if base != name else None


def _team_details(pokemon_list: List[Dict], format_code: str) -> Dict[str, PokemonDetail]:
    details: Dict[str, PokemonDetail] = {}
    for mon in pokemon_list:
        if mon["name"] in details:
            continue
        detail = _lookup(mon["name"], format_code)
        if detail:
            details[mon["name"]] = detail
    return details


def analyze_team_rules(pokemon_list: List[Dict], snapshot: Optional[MetaSnapshot]) -> Dict:
    """Facts about a team that can be computed rather than guessed."""
    report: Dict = {
        "stacked_weaknesses": [],
        "speed": {},
        "support": {},
        "mega": {},
        "meta_presence": [],
        "available": False,
    }

    if not snapshot:
        return report

    format_code = snapshot.format_code
    details = _team_details(pokemon_list, format_code)
    if not details:
        return report

    report["available"] = True

    # Defensive weaknesses shared across the roster.
    weakness_map: Dict[str, List[str]] = {}
    resist_map: Dict[str, List[str]] = {}
    for mon in pokemon_list:
        detail = details.get(mon["name"])
        if not detail:
            continue
        for weak_type in detail.weaknesses:
            weakness_map.setdefault(weak_type, []).append(mon["name"])
        for resist_type in detail.resistances + detail.immunities:
            resist_map.setdefault(resist_type, []).append(mon["name"])

    report["stacked_weaknesses"] = sorted(
        (
            {
                "type": weak_type,
                "count": len(holders),
                "pokemon": holders,
                "resisted_by": resist_map.get(weak_type, []),
            }
            for weak_type, holders in weakness_map.items()
            if len(holders) >= STACKED_WEAKNESS_MIN
        ),
        key=lambda entry: entry["count"],
        reverse=True,
    )

    # Speed, compared against the base speeds of the current top of the meta.
    team_speeds = [
        {"name": mon["name"], "base_speed": details[mon["name"]].base_speed}
        for mon in pokemon_list
        if details.get(mon["name"]) and details[mon["name"]].base_speed is not None
    ]

    if team_speeds:
        fastest = max(entry["base_speed"] for entry in team_speeds)
        faster_meta = []
        for meta_mon in snapshot.pokemon[:META_SAMPLE_SIZE]:
            meta_detail = _lookup(meta_mon.name, format_code)
            if meta_detail and meta_detail.base_speed and meta_detail.base_speed > fastest:
                faster_meta.append({
                    "name": meta_mon.name,
                    "base_speed": meta_detail.base_speed,
                    "usage": meta_mon.usage,
                })

        report["speed"] = {
            "team": sorted(team_speeds, key=lambda entry: entry["base_speed"], reverse=True),
            "fastest": fastest,
            "outsped_by": sorted(faster_meta, key=lambda entry: entry["usage"], reverse=True),
            "meta_sample": META_SAMPLE_SIZE,
        }

    # Support tools, read straight off the movesets.
    all_moves = {move for mon in pokemon_list for move in mon.get("moves", [])}
    abilities = {mon.get("ability") for mon in pokemon_list if mon.get("ability")}
    report["support"] = {
        "speed_control": sorted(all_moves & SPEED_CONTROL_MOVES),
        "redirection": sorted(all_moves & REDIRECTION_MOVES),
        "disruption": sorted(all_moves & DISRUPTION_MOVES),
        "has_intimidate": "Intimidate" in abilities,
        "protect_count": sum(1 for mon in pokemon_list if "Protect" in mon.get("moves", [])),
    }

    # Mega plan: only one Mega Evolution is allowed per battle.
    mega_mons = [mon["name"] for mon in pokemon_list if _strip_form(mon["name"]) != mon["name"]]
    report["mega"] = {"count": len(mega_mons), "pokemon": mega_mons}

    # How much of the current meta the team is actually running.
    usage_by_name = {_strip_form(p.name).lower(): p for p in snapshot.pokemon[:META_SAMPLE_SIZE]}
    report["meta_presence"] = [
        {"name": mon["name"], "usage": usage_by_name[_strip_form(mon["name"]).lower()].usage}
        for mon in pokemon_list
        if _strip_form(mon["name"]).lower() in usage_by_name
    ]

    return report


def report_to_prompt(report: Dict) -> str:
    """Flatten the computed report into prompt context."""
    if not report.get("available"):
        return ""

    lines: List[str] = ["Computed facts about this team (already verified, do not contradict these):"]

    for entry in report["stacked_weaknesses"]:
        resisted = f"; resisted by {', '.join(entry['resisted_by'])}" if entry["resisted_by"] else "; nothing on the team resists it"
        lines.append(f"- {entry['count']} members are weak to {entry['type']} ({', '.join(entry['pokemon'])}){resisted}")

    speed = report.get("speed") or {}
    if speed:
        outsped = speed.get("outsped_by", [])
        lines.append(f"- Fastest base speed on the team is {speed['fastest']}")
        if outsped:
            names = ", ".join(f"{m['name']} ({m['base_speed']} base, {m['usage']}% usage)" for m in outsped[:5])
            lines.append(f"- Top-meta Pokemon faster than that: {names}")

    support = report.get("support") or {}
    if support:
        lines.append(
            f"- Speed control: {', '.join(support['speed_control']) or 'none'}"
            f"; redirection: {', '.join(support['redirection']) or 'none'}"
            f"; Intimidate: {'yes' if support['has_intimidate'] else 'no'}"
            f"; Protect on {support['protect_count']} members"
        )

    mega = report.get("mega") or {}
    if mega.get("count"):
        lines.append(f"- Mega forms on the team: {', '.join(mega['pokemon'])} (only one may Mega Evolve per battle)")
    else:
        lines.append("- No Mega Evolution on this team, which gives up the format's main gimmick")

    return "\n".join(lines)
