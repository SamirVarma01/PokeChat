import os
import re
import openai
from dotenv import load_dotenv
from typing import Dict, List, Optional

from services.pikalytics import get_current_meta
from services.analysis import analyze_team_rules, report_to_prompt

load_dotenv()

TOP_THREAT_COUNT = 20
NATURE_LINE = re.compile(r"^[A-Za-z]+ Nature$")

# Any OpenAI-compatible endpoint works here. Groq's free tier is the default;
# override for OpenAI (https://api.openai.com/v1), Gemini, OpenRouter, or a
# local Ollama at http://localhost:11434/v1.
LLM_BASE_URL = os.getenv("LLM_BASE_URL", "https://api.groq.com/openai/v1")
LLM_MODEL = os.getenv("LLM_MODEL", "openai/gpt-oss-120b")
LLM_API_KEY = os.getenv("GROQ_API_KEY") or os.getenv("LLM_API_KEY") or ""


def computed_findings(report: Dict) -> Dict[str, List[Dict]]:
    """Turn the rule-based report into the same shape the UI already renders."""
    findings: Dict[str, List[Dict]] = {"strengths": [], "weaknesses": [], "threats": [], "suggestions": []}

    if not report.get("available"):
        return findings

    for entry in report["stacked_weaknesses"]:
        bucket = "threats" if not entry["resisted_by"] else "weaknesses"
        resisted = (
            f"Only {', '.join(entry['resisted_by'])} resists it."
            if entry["resisted_by"]
            else "Nothing on the team resists it."
        )
        findings[bucket].append({
            "point": f"{entry['count']} members weak to {entry['type']}",
            "reasoning": f"{', '.join(entry['pokemon'])} all take super effective damage from {entry['type']}. {resisted}",
            "source": "computed",
        })

    mega = report.get("mega") or {}
    if mega.get("count", 0) > 1:
        findings["suggestions"].append({
            "type": "mega_plan",
            "description": (
                f"{', '.join(mega['pokemon'])} both carry Mega Stones, but only one may Mega Evolve per battle. "
                "Decide which is the intended Mega and consider freeing the other item slot."
            ),
            "priority": "medium",
            "source": "computed",
        })
    elif mega.get("count") == 0:
        findings["suggestions"].append({
            "type": "mega_plan",
            "description": "No Mega Evolution on this team, which gives up the format's defining mechanic.",
            "priority": "high",
            "source": "computed",
        })

    support = report.get("support") or {}
    if support.get("speed_control"):
        findings["strengths"].append({
            "point": f"Speed control: {', '.join(support['speed_control'])}",
            "reasoning": "Turn order is the main lever in doubles, and this team can change it.",
            "source": "computed",
        })
    else:
        findings["weaknesses"].append({
            "point": "No speed control",
            "reasoning": "No Tailwind, Trick Room or speed-lowering move, so turn order is fixed by base stats.",
            "source": "computed",
        })

    if support.get("has_intimidate"):
        findings["strengths"].append({
            "point": "Intimidate support",
            "reasoning": "Physical attackers on the other side are softened on switch-in.",
            "source": "computed",
        })

    speed = report.get("speed") or {}
    for threat in (speed.get("outsped_by") or [])[:3]:
        findings["threats"].append({
            "point": f"{threat['name']} outspeeds your whole team",
            "reasoning": (
                f"{threat['name']} sits at {threat['base_speed']} base speed against your fastest at "
                f"{speed['fastest']}, and appears on {threat['usage']}% of teams."
            ),
            "source": "computed",
        })

    presence = report.get("meta_presence") or []
    if presence:
        findings["strengths"].append({
            "point": f"Running {len(presence)} top-meta Pokemon",
            "reasoning": ", ".join(f"{p['name']} ({p['usage']}% usage)" for p in presence) + ".",
            "source": "computed",
        })

    return findings


def build_meta_context() -> tuple[str, str]:
    """Current-format name and a usage digest for the prompt.

    Returns empty strings when Pikalytics is unreachable so an analysis can
    still run, just without live meta grounding.
    """
    try:
        snapshot = get_current_meta()
    except Exception:
        return "", ""

    lines = [
        f"- {p.name}: {p.usage}% usage"
        + (f", {p.win_rate}% win rate" if p.win_rate is not None else "")
        for p in snapshot.pokemon[:TOP_THREAT_COUNT]
    ]

    cores = [f"- {' + '.join(c.members)} ({c.usage}% of teams)" for c in snapshot.cores[:5]]

    context = f"Most used Pokemon in {snapshot.format_name} right now:\n" + "\n".join(lines)
    if cores:
        context += "\n\nMost common two-Pokemon cores:\n" + "\n".join(cores)

    return snapshot.format_name, context

def parse_showdown_team(team_text: str) -> List[Dict]:
    """Parse a Pokemon Showdown format team into structured data."""
    pokemon_list = []
    current_pokemon = {}
    
    lines = team_text.strip().split('\n')
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # Attribute lines are "Key: value" or a trailing "<Nature> Nature";
        # anything else at the start of a block names a Pokemon.
        is_attribute = bool(re.match(r"^[A-Za-z][A-Za-z .]*:", line)) or bool(NATURE_LINE.match(line))

        if not line.startswith(' ') and not line.startswith('-') and not is_attribute:
            # Save previous Pokemon if exists
            if current_pokemon:
                pokemon_list.append(current_pokemon)
                current_pokemon = {}
            
            # Parse new Pokemon line
            parts = line.split(' @ ')
            name = parts[0].strip()
            item = parts[1].strip() if len(parts) > 1 else None
            
            current_pokemon = {
                'name': name,
                'item': item,
                'ability': None,
                'nature': None,
                'level': None,
                'tera_type': None,
                'evs': {},
                'ivs': {},
                'moves': []
            }
        
        # Ability
        elif line.startswith('Ability:'):
            current_pokemon['ability'] = line.replace('Ability:', '').strip()
        
        # Level
        elif line.startswith('Level:'):
            level_text = line.replace('Level:', '').strip()
            try:
                current_pokemon['level'] = int(level_text)
            except ValueError:
                current_pokemon['level'] = None
        
        # Tera Type
        elif line.startswith('Tera Type:'):
            current_pokemon['tera_type'] = line.replace('Tera Type:', '').strip()
        
        # Nature ("Adamant Nature")
        elif NATURE_LINE.match(line):
            current_pokemon['nature'] = re.sub(r"\s*Nature$", "", line).strip()
        
        # EVs
        elif line.startswith('EVs:'):
            ev_text = line.replace('EVs:', '').strip()
            evs = {}
            for ev_part in ev_text.split('/'):
                ev_part = ev_part.strip()
                if ' ' in ev_part:
                    # Extract the number from strings like "252 HP" or "4 SpD"
                    parts = ev_part.split()
                    if len(parts) >= 2:
                        try:
                            value = int(parts[0])
                            stat = ' '.join(parts[1:])  # Handle multi-word stats like "Sp. Atk"
                            evs[stat] = value
                        except ValueError:
                            # Skip invalid EV entries
                            continue
            current_pokemon['evs'] = evs
        
        # IVs (can appear after moves)
        elif line.startswith('IVs:'):
            iv_text = line.replace('IVs:', '').strip()
            ivs = {}
            for iv_part in iv_text.split('/'):
                iv_part = iv_part.strip()
                if ' ' in iv_part:
                    # Extract the number from strings like "31 HP" or "0 SpD"
                    parts = iv_part.split()
                    if len(parts) >= 2:
                        try:
                            value = int(parts[0])
                            stat = ' '.join(parts[1:])  # Handle multi-word stats like "Sp. Atk"
                            ivs[stat] = value
                        except ValueError:
                            # Skip invalid IV entries
                            continue
            current_pokemon['ivs'] = ivs
        
        # Moves
        elif line.startswith('-'):
            move = line.replace('-', '').strip()
            current_pokemon['moves'].append(move)
    
    # Add the last Pokemon
    if current_pokemon:
        pokemon_list.append(current_pokemon)
    
    return pokemon_list

def merge_findings(analysis: Dict, computed: Dict[str, List[Dict]], rule_report: Dict) -> Dict:
    """Computed facts first, then the model's prose, each tagged with its source."""
    merged = dict(analysis)

    for bucket in ("strengths", "weaknesses", "threats", "suggestions"):
        model_items = analysis.get(bucket) or []
        for item in model_items:
            if isinstance(item, dict):
                item.setdefault("source", "ai")
        merged[bucket] = computed[bucket] + [i for i in model_items if isinstance(i, dict)]

    merged["computed"] = rule_report
    merged["llm_used"] = True
    return merged


def analyze_team_with_llm(team_data: str) -> dict:
    """Analyze a team.

    The rule-based half always runs. The written coaching runs only when the
    server has an LLM key configured (GROQ_API_KEY in backend/.env).
    """
    try:
        pokemon_list = parse_showdown_team(team_data)

        if not pokemon_list:
            return {
                "error": "Invalid team format. Please use Pokemon Showdown format.",
                "grade": None,
                "strengths": [],
                "weaknesses": [],
                "threats": [],
                "suggestions": []
            }
        
        # Create a structured prompt
        team_summary = "\n".join([
            f"{p['name']} @ {p['item'] or 'No Item'}\n" +
            f"Ability: {p['ability'] or 'Default'}\n" +
            f"Level: {p['level'] or '50'}\n" +
            f"Nature: {p['nature'] or 'Default'}\n" +
            f"Moves: {', '.join(p['moves'])}\n" +
            f"EVs: {p['evs']}\n" +
            f"IVs: {p['ivs']}\n"
            for p in pokemon_list
        ])

        format_name, meta_context = build_meta_context()
        format_label = format_name or "the current Pokemon Champions regulation"

        # The rule-based pass is free and runs regardless of whether a key is set.
        try:
            snapshot = get_current_meta()
        except Exception:
            snapshot = None

        rule_report = analyze_team_rules(pokemon_list, snapshot)
        computed = computed_findings(rule_report)

        if not LLM_API_KEY.strip():
            return {
                "grade": None,
                "strengths": computed["strengths"],
                "weaknesses": computed["weaknesses"],
                "threats": computed["threats"],
                "suggestions": computed["suggestions"],
                "computed": rule_report,
                "llm_used": False,
            }

        client = openai.OpenAI(api_key=LLM_API_KEY, base_url=LLM_BASE_URL)

        rules_prompt = f"""You are an expert Pokemon Champions doubles coach and analyst.
You are coaching for {format_label}.

Format rules you must apply:
- Double battles. Players bring 6 Pokemon and pick 4 for each game.
- All Pokemon are set to level 50. Games have a 20 minute limit.
- Mega Evolution is the active battle gimmick. A Pokemon Mega Evolves by holding its Mega
  Stone, and each player may Mega Evolve only ONCE per battle, even if several team members
  carry Mega Stones. Mega Stones cannot be removed by Knock Off.
- Terastallization does NOT exist in this format. Never suggest Tera types.
- Item clause: no two Pokemon on a team may hold the same item.
- Species clause: no duplicate Pokemon on a team.
"""

        schema_prompt = """
Analyze the given team and provide a comprehensive assessment in the following JSON format:

{
    "grade": "A/B/C/D/F",
    "strengths": [
        {
            "point": "specific strength",
            "reasoning": "explanation of why this is a strength"
        }
    ],
    "weaknesses": [
        {
            "point": "specific weakness",
            "reasoning": "explanation of why this is a weakness"
        }
    ],
    "threats": [
        {
            "point": "specific threat",
            "reasoning": "explanation of why this is a threat"
        }
    ],
    "suggestions": [
        {
            "type": "move_change/item_change/ability_change/pokemon_swap",
            "description": "specific suggestion",
            "priority": "high/medium/low"
        }
    ]
}

Consider:
- Type coverage and synergy
- Speed control and positioning
- Which slot is the intended Mega Evolution, and whether spare Mega Stones are wasted
- Item optimization within the item clause
- Move coverage and team composition balance

Ground your threats in the live usage data above: name real Pokemon and cores the player
will actually face, and prefer high-usage threats over theoretical ones.
For each strength, weakness, and threat, explain WHY it matters."""

        computed_context = report_to_prompt(rule_report)
        system_prompt = (
            rules_prompt
            + ("\n" + meta_context + "\n" if meta_context else "")
            + ("\n" + computed_context + "\n" if computed_context else "")
            + schema_prompt
        )

        user_prompt = f"Please analyze this {format_label} team:\n\n{team_summary}"

        try:
            response = client.chat.completions.create(
                model=LLM_MODEL,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.7,
                max_tokens=1000
            )
            analysis_text = response.choices[0].message.content
        except openai.AuthenticationError:
            return _degraded(computed, rule_report, "The server's API key was rejected. Showing the computed analysis only.")
        except openai.RateLimitError:
            return _degraded(computed, rule_report, "Free-tier rate limit reached. Showing the computed analysis only.")
        except Exception as e:
            return _degraded(computed, rule_report, f"AI analysis failed ({e}). Showing the computed analysis only.")

        import json

        analysis = None
        start_idx = analysis_text.find('{')
        end_idx = analysis_text.rfind('}') + 1
        if start_idx != -1 and end_idx > start_idx:
            try:
                analysis = json.loads(analysis_text[start_idx:end_idx])
            except json.JSONDecodeError:
                analysis = None

        if analysis is None:
            # Rather than invent a grade, fall back to what was actually computed.
            return _degraded(computed, rule_report, "The model did not return usable JSON. Showing the computed analysis only.")

        return merge_findings(analysis, computed, rule_report)

    except Exception as e:
        return {
            "error": f"Analysis failed: {str(e)}",
            "grade": None,
            "strengths": [],
            "weaknesses": [],
            "threats": [],
            "suggestions": []
        }


def _degraded(computed: Dict[str, List[Dict]], rule_report: Dict, message: str) -> Dict:
    """Keep serving the free rule-based half when the model call fails."""
    return {
        "error": message,
        "grade": None,
        "strengths": computed["strengths"],
        "weaknesses": computed["weaknesses"],
        "threats": computed["threats"],
        "suggestions": computed["suggestions"],
        "computed": rule_report,
        "llm_used": False,
    }