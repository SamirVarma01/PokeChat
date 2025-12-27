import os
import openai
from dotenv import load_dotenv
from typing import Dict, List, Optional

load_dotenv()

def parse_showdown_team(team_text: str) -> List[Dict]:
    """Parse a Pokemon Showdown format team into structured data."""
    pokemon_list = []
    current_pokemon = {}
    
    lines = team_text.strip().split('\n')
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # New Pokemon (starts with name and optional @item)
        if not line.startswith(' ') and not line.startswith('-') and not line.startswith('EVs:') and not line.startswith('IVs:') and not line.startswith('Ability:') and not line.startswith('Nature') and not line.startswith('Level:') and not line.startswith('Tera Type:'):
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
        
        # Nature
        elif line.startswith('Nature'):
            current_pokemon['nature'] = line.replace('Nature', '').strip()
        
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

def analyze_team_with_llm(team_data: str, api_key: str) -> dict:
    """Analyze a Pokemon team using OpenAI GPT-4."""
    try:
        # Create OpenAI client with user-provided API key
        client = openai.OpenAI(api_key=api_key)
        # Parse the team
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
            f"Tera Type: {p['tera_type'] or 'None'}\n" +
            f"Nature: {p['nature'] or 'Default'}\n" +
            f"Moves: {', '.join(p['moves'])}\n" +
            f"EVs: {p['evs']}\n" +
            f"IVs: {p['ivs']}\n"
            for p in pokemon_list
        ])
        
        system_prompt = """You are an expert VGC (Video Game Championships) Pokemon coach and analyst.
        Specifically, you are a coach for the Generation 9 (Scarlet and Violet) VGC formats. 
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
        - Common meta threats
        - Item optimization
        - Move coverage
        - Team composition balance
        - Current VGC meta trends
        
        For each strength, weakness, and threat, provide a clear explanation of WHY it's important."""
        
        user_prompt = f"Please analyze this VGC team:\n\n{team_summary}"
        
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7,
            max_tokens=1000
        )
        
        # Parse the response
        analysis_text = response.choices[0].message.content
        
        # Try to extract JSON from the response
        try:
            import json
            # Find JSON in the response
            start_idx = analysis_text.find('{')
            end_idx = analysis_text.rfind('}') + 1
            if start_idx != -1 and end_idx != 0:
                json_str = analysis_text[start_idx:end_idx]
                analysis = json.loads(json_str)
            else:
                # Fallback if no JSON found
                analysis = {
                    "grade": "B",
                    "strengths": [{"point": "Team analysis completed", "reasoning": "Basic analysis was successful"}],
                    "weaknesses": [{"point": "Could not parse detailed analysis", "reasoning": "LLM response format was unclear"}],
                    "threats": [{"point": "Common meta threats", "reasoning": "Standard VGC meta considerations apply"}],
                    "suggestions": [{"type": "general", "description": "Consider reviewing team composition", "priority": "medium"}]
                }
        except json.JSONDecodeError:
            # Fallback if JSON parsing fails
            analysis = {
                "grade": "B",
                "strengths": [{"point": "Team analysis completed", "reasoning": "Basic analysis was successful"}],
                "weaknesses": [{"point": "Could not parse detailed analysis", "reasoning": "LLM response format was unclear"}],
                "threats": [{"point": "Common meta threats", "reasoning": "Standard VGC meta considerations apply"}],
                "suggestions": [{"type": "general", "description": "Consider reviewing team composition", "priority": "medium"}]
            }
        
        return analysis
        
    except openai.AuthenticationError as e:
        return {
            "error": "Invalid OpenAI API key. Please check your API key and try again.",
            "grade": None,
            "strengths": [],
            "weaknesses": [],
            "threats": [],
            "suggestions": []
        }
    except openai.RateLimitError as e:
        return {
            "error": "OpenAI API rate limit exceeded. Please try again later.",
            "grade": None,
            "strengths": [],
            "weaknesses": [],
            "threats": [],
            "suggestions": []
        }
    except Exception as e:
        return {
            "error": f"Analysis failed: {str(e)}",
            "grade": None,
            "strengths": [],
            "weaknesses": [],
            "threats": [],
            "suggestions": []
        } 