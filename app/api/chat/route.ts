import { NextRequest, NextResponse } from 'next/server'
import { AIService } from '@/lib/ai-service'

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const aiService = AIService.getInstance()
    const aiResponse = await aiService.generateResponse(prompt)

    if (aiResponse.success) {
      return NextResponse.json({ content: aiResponse.content })
    } else {
      return NextResponse.json({ error: aiResponse.error || 'AI service error' }, { status: 500 })
    }
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
