import { NextRequest, NextResponse } from 'next/server'
import { AIService } from '@/lib/ai-service'

export async function POST(request: NextRequest) {
  try {
    const { companyId } = await request.json()

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      )
    }

    const aiService = AIService.getInstance()
    const leadScore = await aiService.scoreLead(companyId)

    return NextResponse.json({
      success: true,
      leadScore
    })

  } catch (error) {
    console.error('Lead Scoring API Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to score lead',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const companyId = searchParams.get('companyId')

  if (!companyId) {
    return NextResponse.json(
      { error: 'Company ID parameter is required' },
      { status: 400 }
    )
  }

  try {
    const aiService = AIService.getInstance()
    const leadScore = await aiService.scoreLead(companyId)

    return NextResponse.json({
      success: true,
      leadScore
    })

  } catch (error) {
    console.error('Lead Scoring API Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to score lead',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
