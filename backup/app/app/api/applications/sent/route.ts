
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Nu ești autentificat' },
        { status: 401 }
      )
    }

    const applications = await prisma.application.findMany({
      where: { candidateId: session.user.id },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            company: true,
            location: true,
            category: true,
            salary: true,
            recruiter: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        resume: {
          select: {
            originalName: true,
            cloudStoragePath: true
          }
        },
        score: true
      },
      orderBy: { appliedAt: 'desc' }
    })

    return NextResponse.json({ applications })

  } catch (error) {
    console.error('Error fetching sent applications:', error)
    return NextResponse.json(
      { message: 'Nu s-au putut încărca aplicațiile' },
      { status: 500 }
    )
  }
}
