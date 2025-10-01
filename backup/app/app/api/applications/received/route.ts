
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'RECRUITER') {
      return NextResponse.json(
        { message: 'Nu ai permisiunea să vezi aplicațiile' },
        { status: 403 }
      )
    }

    const applications = await prisma.application.findMany({
      where: {
        job: {
          recruiterId: session.user.id
        }
      },
      include: {
        candidate: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            experienceLevel: true
          }
        },
        job: {
          select: {
            id: true,
            title: true,
            company: true,
            category: true
          }
        },
        resume: {
          select: {
            id: true,
            originalName: true,
            cloudStoragePath: true,
            uploadedAt: true
          }
        },
        score: true
      },
      orderBy: { appliedAt: 'desc' }
    })

    return NextResponse.json({ applications })

  } catch (error) {
    console.error('Error fetching received applications:', error)
    return NextResponse.json(
      { message: 'Nu s-au putut încărca aplicațiile' },
      { status: 500 }
    )
  }
}
