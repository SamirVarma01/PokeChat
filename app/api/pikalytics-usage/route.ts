import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Proxy the request to your backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000'
    const refresh = request.nextUrl.searchParams.get('refresh') === 'true'
    const response = await fetch(`${backendUrl}/pikalytics-usage${refresh ? '?refresh=true' : ''}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: errorData.detail || 'Failed to fetch usage data' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('Error in pikalytics-usage API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
