from fastapi import APIRouter
from pydantic import BaseModel
from services.llm import analyze_team_with_llm

router = APIRouter()

class AnalyzeRequest(BaseModel):
    team: str

@router.post("/analyze-team")
def analyze_team(request: AnalyzeRequest):
    """Analyze a Pokemon team. The LLM key is server-side configuration."""
    return analyze_team_with_llm(request.team) 