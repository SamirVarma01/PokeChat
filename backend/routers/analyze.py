from fastapi import APIRouter, Body
from pydantic import BaseModel
from services.llm import analyze_team_with_llm

router = APIRouter()

class AnalyzeRequest(BaseModel):
    team: str
    apiKey: str

@router.post("/analyze-team")
def analyze_team(request: AnalyzeRequest):
    """Analyze a Pokemon team using LLM."""
    analysis = analyze_team_with_llm(request.team, request.apiKey)
    return analysis 