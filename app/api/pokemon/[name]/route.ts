import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params

  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000'
    const response = await fetch(`${backendUrl}/pokemon/${encodeURIComponent(name)}`)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { error: errorData.detail || 'Failed to fetch Pokemon data' },
        { status: response.status },
      )
    }

    return NextResponse.json(await response.json())
  } catch (error) {
    console.error('Error in pokemon API route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
