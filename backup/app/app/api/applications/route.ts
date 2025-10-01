
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'CANDIDATE') {
      return NextResponse.json(
        { message: 'Nu ai permisiunea să aplici la locuri de muncă' },
        { status: 403 }
      )
    }

    const { jobId, resumeId, coverLetter } = await request.json()

    if (!jobId || !resumeId) {
      return NextResponse.json(
        { message: 'JobId și ResumeId sunt obligatorii' },
        { status: 400 }
      )
    }

    // Check if user already applied
    const existingApplication = await prisma.application.findUnique({
      where: {
        candidateId_jobId: {
          candidateId: session.user.id,
          jobId: jobId
        }
      }
    })

    if (existingApplication) {
      return NextResponse.json(
        { message: 'Ai aplicat deja la acest loc de muncă' },
        { status: 400 }
      )
    }

    // Verify job exists and is active
    const job = await prisma.job.findUnique({
      where: { id: jobId, isActive: true }
    })

    if (!job) {
      return NextResponse.json(
        { message: 'Locul de muncă nu a fost găsit sau nu mai este activ' },
        { status: 404 }
      )
    }

    // Verify resume belongs to user
    const resume = await prisma.resume.findUnique({
      where: { id: resumeId, userId: session.user.id }
    })

    if (!resume) {
      return NextResponse.json(
        { message: 'CV-ul nu a fost găsit' },
        { status: 404 }
      )
    }

    const application = await prisma.application.create({
      data: {
        candidateId: session.user.id,
        jobId: jobId,
        resumeId: resumeId,
        coverLetter: coverLetter || null,
        status: 'PENDING'
      },
      include: {
        job: {
          select: {
            title: true,
            company: true
          }
        },
        resume: {
          select: {
            originalName: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Aplicația a fost trimisă cu succes',
      application
    })

  } catch (error) {
    console.error('Error creating application:', error)
    return NextResponse.json(
      { message: 'Nu s-a putut trimite aplicația' },
      { status: 500 }
    )
  }
}
