import { NextResponse } from 'next/server'
import { AIService } from '@/lib/ai-service'

const PROMPT = `Generate 10 Danish vocab flashcards for job seekers from Romanian: words for agriculture/farm work. Each flashcard should have:
- Romanian term
- Danish term
- English term
- A simple example sentence in Danish

Format as JSON array of objects: [
  {
    "romanian": "arbore",
    "danish": "træ",
    "english": "tree",
    "example": "Træet er højt i skoven."
  }
]

Focus on practical terms for Romanian workers in Denmark: agriculture, farm work, tools, animals, etc. Keep terms simple for beginners.`

export async function GET() {
  try {
    const aiService = AIService.getInstance()
    const response = await aiService.generateResponse(PROMPT)
    
    // Parse the response as JSON if possible, fallback to empty array
    let parsedFlashcards = []
    try {
      parsedFlashcards = JSON.parse(response.content)
    } catch {
      // If not JSON, split into array or use fallback
      parsedFlashcards = []
    }

    return NextResponse.json({ flashcards: parsedFlashcards || [] })
  } catch (error) {
    console.error('Error generating flashcards:', error)
    return NextResponse.json({ flashcards: [], error: 'Failed to generate flashcards' }, { status: 500 })
  }
}
