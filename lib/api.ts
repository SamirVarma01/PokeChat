import { fetchTeamFromPokepaste } from './pokepaste';

export type FindingSource = 'computed' | 'ai';

export interface AnalysisPoint {
  point: string;
  reasoning: string;
  source?: FindingSource;
}

export interface LLMAnalysisResult {
  grade: string | null;
  strengths: AnalysisPoint[];
  weaknesses: AnalysisPoint[];
  threats: AnalysisPoint[];
  suggestions: Array<{
    type: string;
    description: string;
    priority: string;
    source?: FindingSource;
  }>;
  llm_used?: boolean;
  error?: string;
}

export interface AnalyzeTeamRequest {
  team: string;
  apiKey?: string;
}

/**
 * Analyzes a Pokemon team. Without an API key only the free rule-based half runs.
 */
export async function analyzeTeam(teamData: string, apiKey?: string): Promise<LLMAnalysisResult> {
  try {
    const response = await fetch('/api/analyze-team', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ team: teamData, apiKey }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error analyzing team:', error);
    return {
      grade: 'F',
      strengths: [],
      weaknesses: [{ point: 'Failed to analyze team due to technical error', reasoning: 'Please try again later' }],
      threats: [{ point: 'Unknown', reasoning: 'Analysis failed' }],
      suggestions: [{
        type: 'general',
        description: 'Please try again later or check your team format',
        priority: 'high'
      }],
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Fetches team data from a Pokepaste URL
 */
export async function fetchTeamFromUrl(url: string): Promise<string> {
  try {
    return await fetchTeamFromPokepaste(url);
  } catch (error) {
    console.error('Error fetching team from URL:', error);
    throw new Error(`Failed to fetch team from Pokepaste: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
