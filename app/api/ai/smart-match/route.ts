import { NextRequest, NextResponse } from 'next/server'
import { AIService } from '@/lib/ai-service'

export async function POST(request: NextRequest) {
  try {
    const { candidateId, jobId } = await request.json()

    if (!candidateId || !jobId) {
      return NextResponse.json(
        { error: 'Candidate ID and Job ID are required' },
        { status: 400 }
      )
    }

    const aiService = AIService.getInstance()
    const matchResult = await aiService.calculateSmartMatch(candidateId, jobId)

    return NextResponse.json({
      success: true,
      match: matchResult
    })

  } catch (error) {
    console.error('Smart Match API Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to calculate smart match',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const candidateId = searchParams.get('candidateId')
  const jobId = searchParams.get('jobId')

  if (!candidateId || !jobId) {
    return NextResponse.json(
      { error: 'Both candidateId and jobId parameters are required' },
      { status: 400 }
    )
  }

  try {
    const aiService = AIService.getInstance()
    const matchResult = await aiService.calculateSmartMatch(candidateId, jobId)

    return NextResponse.json({
      success: true,
      match: matchResult
    })

  } catch (error) {
    console.error('Smart Match API Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to calculate smart match',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
