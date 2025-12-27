from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import re
from typing import List
from pathlib import Path

router = APIRouter()

class PokemonUsage(BaseModel):
    name: str
    usage: float
    rank: int

class UsageDataResponse(BaseModel):
    pokemon: List[PokemonUsage]
    success: bool
    message: str

def parse_usage_file(file_path: str) -> List[PokemonUsage]:
    """Parse the usage statistics text file and return a list of PokemonUsage objects."""
    pokemon_list = []
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        # Skip header lines until we find the data rows
        # Data rows start after the table header which contains "Rank | Pokemon"
        data_started = False
        
        for line in lines:
            line = line.strip()
            
            # Skip empty lines and table separators
            if not line or line.startswith('+') or '---' in line:
                continue
            
            # Check if we've reached the data section (table header row)
            if 'Rank' in line and 'Pokemon' in line:
                data_started = True
                continue
            
            # Skip lines before data starts
            if not data_started:
                continue
            
            # Parse data rows - format: | rank | Pokemon name | usage% | ... |
            # Example: | 1    | Flutter Mane       | 48.86699% | 147962 | 45.681% | 66797  | 44.096% |
            match = re.match(r'\|\s*(\d+)\s*\|\s*([^|]+)\s*\|\s*([\d.]+)%', line)
            if match:
                rank = int(match.group(1))
                name = match.group(2).strip()
                usage = float(match.group(3))
                
                pokemon_list.append(PokemonUsage(
                    name=name,
                    usage=usage,
                    rank=rank
                ))
        
        return pokemon_list
        
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Usage data file not found: {file_path}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error parsing usage data file: {str(e)}")

@router.get("/pikalytics-usage", response_model=UsageDataResponse)
async def get_pikalytics_usage():
    """Fetch Pokemon usage data from the local usage statistics file"""
    try:
        # Get the path to the data file
        # The file is in the data folder at the project root
        # The backend is in the backend/ folder, so we need to go up one level
        backend_dir = Path(__file__).parent.parent
        project_root = backend_dir.parent
        data_file = project_root / "data" / "gen9vgc2026regfbo3-1760.txt"
        
        # Parse the file
        pokemon_list = parse_usage_file(str(data_file))
        
        return UsageDataResponse(
            pokemon=pokemon_list,
            success=True,
            message=f"Pokemon usage data from {data_file.name}"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching usage data: {str(e)}")

@router.get("/meta")
async def get_meta():
    """Get meta analysis data for the specified format."""
    return {"message": "Meta analysis endpoint - use /pikalytics-usage for Pokemon data"} 