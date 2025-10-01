import { NextRequest, NextResponse } from 'next/server'
import { AIService } from '@/lib/ai-service'

const aiService = AIService.getInstance()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { task, data } = body

    let prompt = ''

    switch (task) {
      case 'research':
        prompt = `Ești un agent de cercetare specializat în recrutarea muncitorilor români pentru ferme și locuri de muncă agricole în Danemarca. Generează strategii de căutare pentru:

1. Site-uri daneze de joburi agricole
2. Platforme internaționale cu joburi în Danemarca
3. Companii agricole daneze care angajează
4. Oportunități sezoniere și permanente

Furnizează URL-uri specifice și strategii de căutare eficiente.

Utilizatorul cere: ${data || 'Generează o listă cuprinzătoare de site-uri daneze și platforme internaționale unde românii pot găsi locuri de muncă în agricultură și ferme.'}`
        break

      case 'extract':
        prompt = `Ești un expert în extragerea datelor din conținut web. Analizează conținutul HTML și extrage informații relevante despre locuri de muncă pentru români în agricultura daneză:

1. Titluri joburi (în daneză și engleză)
2. Nume companii
3. Descrieri joburi
4. Cerințe și calificări
5. Informații salariale
6. Detalii locație
7. Informații contact
8. Termene aplicare

Filtrează doar pozițiile relevante în agricultură, ferme, silvicultură.

Conținut de analizat: ${data || 'Analizează conținutul HTML furnizat și extrage informații relevante despre locuri de muncă.'}`
        break

      case 'strategy':
        prompt = `Ești un strateg de recrutare specializat în conectarea muncitorilor români cu angajatori danezi din agricultură. Pentru fiecare oportunitate de muncă, creează:

1. Emailuri de outreach convingătoare în română și daneză
2. Puncte forte pentru muncitorii români
3. Cercetări despre companii
4. Mesaje de recrutare personalizate
5. Strategii de follow-up

Consideră diferențele culturale, barierele lingvistice și considerațiile practice pentru relocarea românilor în Danemarca.

Date job: ${data || 'Creează strategie pentru oportunitatea de muncă furnizată.'}`
        break

      case 'analyze':
        prompt = `Ești un coordonator AI pentru campanii de recrutare automate. Analizează rezultatele campaniilor și optimizează strategiile viitoare:

Analizează:
1. Rate de succes ale metodelor diferite de outreach
2. Modele de răspuns ale angajatorilor
3. Tendințe pe piața muncii
4. Timing optim și mesaje
5. Considerații culturale și lingvistice

Generează insight-uri și recomandări pentru îmbunătățirea automatizării recrutării.

Rezultate campanie: ${data || 'Analizează rezultatele campaniei furnizate.'}`
        break

      default:
        prompt = data || 'Procesează această cerere de automatizare.'
    }

    const response = await aiService.generateResponse(prompt)

    if (response.success) {
      return NextResponse.json({
        success: true,
        result: response.content,
        task: task
      })
    } else {
      return NextResponse.json({
        success: false,
        error: response.error,
        task: task
      }, { status: 500 })
    }

  } catch (error) {
    console.error('N8N Automation API Error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'N8N Automation API - Romanian-Danish Recruitment',
    endpoints: {
      research: 'POST /api/n8n-automation with task="research"',
      extract: 'POST /api/n8n-automation with task="extract"',
      strategy: 'POST /api/n8n-automation with task="strategy"',
      analyze: 'POST /api/n8n-automation with task="analyze"'
    },
    status: 'active'
  })
}
