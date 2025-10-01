import { NextRequest, NextResponse } from 'next/server'

const apiKey = process.env.OPENROUTER_API_KEY || ''
const model = process.env.OPENROUTER_MODEL || 'z-ai/glm-4.5-air:free'

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://danemarca-jobs.ro',
        'X-Title': 'Locuri de Munca Danemarca'
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: `Ești un asistent virtual specializat în procesul de recrutare pentru Danemarca. 
            Ai următoarele responsabilități:
            
            1. Ajută utilizatorii cu informații despre evaluarea CV-ului
            2. Ofară detalii despre procesul de înregistrare CPR în Danemarca
            3. Explică cerințele de limbă pentru diferite tipuri de muncă
            4. Descrie condițiile de lucru și salariile în Danemarca
            5. Ajută cu informații despre cazare și transport
            6. Răspunde la întrebări despre documentele necesare
            7. Ofară suport pentru procesul de aplicare la locuri de muncă
            
            Limba principală: română
            Ton: profesionist, prietenos, helpful
            
            Informații importante:
            - Salariu minim: 110 DKK/oră
            - Program: 37-40 ore/săptămână
            - Vacanță: 5 săptămâni/an
            - Fără viză necesară pentru cetățenii UE
            - Transport și cazare asigurate de angajator
            
            Menționează întotdeauna că utilizatorul poate accesa secțiunile specifice din platformă pentru mai multe detalii.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      throw new Error('No response content received')
    }

    return NextResponse.json({ content })

  } catch (error) {
    console.error('Chat API Error:', error)
    
    // Fallback response
    let fallback = "Îmi pare rău, am întâmpinat o problemă tehnică. Te rog să încerci mai târziu sau să contactezi suportul."
    
    try {
      const body = await request.json()
      const lowerPrompt = (body?.prompt || '').toLowerCase()
      if (lowerPrompt.includes('cv') || lowerPrompt.includes('evaluare')) {
        fallback = "Pentru evaluarea CV-ului, te rog să accesezi secțiunea 'Evaluare CV cu AI' din meniu. Sistemul nostru analizează automat CV-ul tău și oferă un scor de potrivire cu posturile disponibile."
      } else if (lowerPrompt.includes('danemarca') || lowerPrompt.includes('cpr')) {
        fallback = "În secțiunea 'Ghid Danemarca' găsești informații complete despre înregistrarea CPR, cerințele de limbă și condițiile de lucru. Ca cetățean UE, nu ai nevoie de viză pentru a munci în Danemarca."
      }
    } catch {
      // ignore
    }
    
    return NextResponse.json({ content: fallback })
  }
}
