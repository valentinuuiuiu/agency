
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { downloadFile } from '@/lib/s3'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'RECRUITER') {
      return NextResponse.json(
        { message: 'Nu ai permisiunea să evaluezi aplicațiile' },
        { status: 403 }
      )
    }

    // Get application with job and resume details
    const application = await prisma.application.findFirst({
      where: {
        id: id,
        job: {
          recruiterId: session.user.id
        }
      },
      include: {
        job: {
          select: {
            title: true,
            description: true,
            requirements: true,
            category: true,
            experienceRequired: true,
            languageRequirement: true
          }
        },
        resume: {
          select: {
            cloudStoragePath: true,
            originalName: true
          }
        },
        candidate: {
          select: {
            firstName: true,
            lastName: true,
            experienceLevel: true
          }
        }
      }
    })

    if (!application) {
      return NextResponse.json(
        { message: 'Aplicația nu a fost găsită' },
        { status: 404 }
      )
    }

    // Check if already scored
    const existingScore = await prisma.score.findUnique({
      where: { applicationId: application.id }
    })

    if (existingScore) {
      return NextResponse.json(
        { message: 'Această aplicație a fost deja evaluată' },
        { status: 400 }
      )
    }

    // Download resume from S3
    const resumeUrl = await downloadFile(application.resume?.cloudStoragePath || '')
    
    // Get resume content as base64 for LLM API
    const resumeResponse = await fetch(resumeUrl)
    const resumeBuffer = await resumeResponse.arrayBuffer()
    const resumeBase64 = Buffer.from(resumeBuffer).toString('base64')

    // Prepare job context for LLM
    const jobContext = `
Titlul postului: ${application.job.title}
Categoria: ${application.job.category}
Descriere: ${application.job.description}
Cerințe: ${application.job.requirements}
Experiența necesară: ${application.job.experienceRequired}
Cerințe de limbă: ${application.job.languageRequirement}
Candidat: ${application.candidate.firstName} ${application.candidate.lastName}
Nivel experiență candidat: ${application.candidate.experienceLevel}
`

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()

        try {
          const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`
            },
            body: JSON.stringify({
              model: 'gpt-4.1-mini',
              messages: [
                {
                  role: 'user',
                  content: [
                    {
                      type: 'text',
                      text: `Ești un recruiter expert care evaluează CV-uri pentru locuri de muncă în silvicultură și agricultură în Danemarca. Evaluează următorul CV față de cerințele postului și returnează un răspuns în JSON cu următorul format exact:

{
  "overallScore": [scor între 1-100],
  "pros": ["Exact 2 puncte forte specifice identificate în CV", "Al doilea punct forte"],
  "cons": ["Exact 2 zone de îmbunătățire sau lipsuri", "A doua zonă de îmbunătățire"],
  "feedback": "Feedback general de 2-3 propoziții despre potrivirea candidatului"
}

Context job:
${jobContext}

Evaluează CV-ul anexat și consideră:
- Experiența relevantă în agricultură/silvicultură
- Cunoștințele de limbă (română/engleză/daneză)
- Calificările și certificările relevante  
- Disponibilitatea pentru muncă în Danemarca
- Aptitudinile fizice pentru muncă în exterior

Răspunde doar cu JSON-ul, fără alte explicații.`
                    },
                    {
                      type: 'file',
                      file: {
                        filename: application.resume?.originalName || 'resume.pdf',
                        file_data: `data:application/pdf;base64,${resumeBase64}`
                      }
                    }
                  ]
                }
              ],
              response_format: { type: "json_object" },
              stream: true,
              max_tokens: 3000
            })
          })

          if (!response.ok) {
            throw new Error('Failed to get LLM response')
          }

          const reader = response.body?.getReader()
          const decoder = new TextDecoder()
          let buffer = ''
          let partialRead = ''

          // Send progress updates
          const progressData = JSON.stringify({
            status: 'processing',
            message: 'Analizez CV-ul...'
          })
          controller.enqueue(encoder.encode(`data: ${progressData}\n\n`))

          while (true) {
            const { done, value } = await reader?.read() || { done: true, value: undefined }
            if (done) break

            partialRead += decoder.decode(value, { stream: true })
            let lines = partialRead.split('\n')
            partialRead = lines.pop() || ''

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6)
                if (data === '[DONE]') {
                  // Parse the final buffer as JSON
                  const finalResult = JSON.parse(buffer)
                  
                  // Save score to database
                  await prisma.score.create({
                    data: {
                      overallScore: finalResult.overallScore,
                      pros: finalResult.pros,
                      cons: finalResult.cons,
                      feedback: finalResult.feedback,
                      applicationId: application.id,
                      resumeId: application.resumeId!
                    }
                  })

                  const completedData = JSON.stringify({
                    status: 'completed',
                    result: {
                      overallScore: finalResult.overallScore,
                      pros: finalResult.pros,
                      cons: finalResult.cons,
                      feedback: finalResult.feedback
                    }
                  })
                  controller.enqueue(encoder.encode(`data: ${completedData}\n\n`))
                  controller.enqueue(encoder.encode('data: [DONE]\n\n'))
                  return
                }
                
                try {
                  const parsed = JSON.parse(data)
                  buffer += parsed.choices?.[0]?.delta?.content || ''
                  
                  // Send progress update
                  const progressData = JSON.stringify({
                    status: 'processing',
                    message: 'Generez evaluarea...'
                  })
                  controller.enqueue(encoder.encode(`data: ${progressData}\n\n`))
                } catch {
                  // Skip invalid JSON
                }
              }
            }
          }

        } catch (error) {
          console.error('LLM scoring error:', error)
          const errorData = JSON.stringify({
            status: 'error',
            message: 'Eroare la evaluarea CV-ului'
          })
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`))
        } finally {
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error) {
    console.error('Error in scoring route:', error)
    return NextResponse.json(
      { message: 'Nu s-a putut evalua CV-ul' },
      { status: 500 }
    )
  }
}
