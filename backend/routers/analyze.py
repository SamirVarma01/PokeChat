from fastapi import APIRouter, Body
from pydantic import BaseModel
from typing import Optional
from services.llm import analyze_team_with_llm

router = APIRouter()

class AnalyzeRequest(BaseModel):
    team: str
    # Optional: without a key only the free rule-based analysis runs.
    apiKey: Optional[str] = None

@router.post("/analyze-team")
def analyze_team(request: AnalyzeRequest):
    """Analyze a Pokemon team using LLM."""
    analysis = analyze_team_with_llm(request.team, request.apiKey)
    return analysis 