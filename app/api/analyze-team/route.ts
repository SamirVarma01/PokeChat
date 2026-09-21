import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { team } = body;

    if (!team) {
      return NextResponse.json(
        { error: 'Team data is required' },
        { status: 400 }
      );
    }

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    const backendResponse = await fetch(`${backendUrl}/analyze-team`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ team }),
    });

    if (!backendResponse.ok) {
      throw new Error(`Backend error: ${backendResponse.status}`);
    }

    const result = await backendResponse.json();
    return NextResponse.json(result);

  } catch (error) {
    console.error('Error in analyze-team API route:', error);
    return NextResponse.json(
      { 
        error: 'Failed to analyze team',
        grade: 'F',
        strengths: [],
        weaknesses: ['Technical error occurred during analysis'],
        threats: ['Unknown'],
        suggestions: [{
          type: 'general',
          description: 'Please try again later',
          priority: 'high'
        }]
      },
      { status: 500 }
    );
  }
}
