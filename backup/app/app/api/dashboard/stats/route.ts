
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

    const isRecruiter = session.user.role === 'RECRUITER'

    if (isRecruiter) {
      // Get stats for recruiters
      const totalJobs = await prisma.job.count({
        where: { recruiterId: session.user.id }
      })

      const totalApplications = await prisma.application.count({
        where: {
          job: {
            recruiterId: session.user.id
          }
        }
      })

      const pendingReviews = await prisma.application.count({
        where: {
          job: {
            recruiterId: session.user.id
          },
          status: 'PENDING'
        }
      })

      const acceptedApplications = await prisma.application.count({
        where: {
          job: {
            recruiterId: session.user.id
          },
          status: 'ACCEPTED'
        }
      })

      return NextResponse.json({
        totalJobs,
        totalApplications,
        pendingReviews,
        acceptedApplications
      })

    } else {
      // Get stats for candidates
      const totalApplications = await prisma.application.count({
        where: { candidateId: session.user.id }
      })

      const pendingReviews = await prisma.application.count({
        where: {
          candidateId: session.user.id,
          status: 'PENDING'
        }
      })

      const acceptedApplications = await prisma.application.count({
        where: {
          candidateId: session.user.id,
          status: 'ACCEPTED'
        }
      })

      // Calculate average score
      const scoresResult = await prisma.score.findMany({
        where: {
          application: {
            candidateId: session.user.id
          }
        },
        select: {
          overallScore: true
        }
      })

      const averageScore = scoresResult.length > 0
        ? Math.round(scoresResult.reduce((sum, score) => sum + score.overallScore, 0) / scoresResult.length)
        : 0

      return NextResponse.json({
        totalJobs: 0,
        totalApplications,
        pendingReviews,
        acceptedApplications,
        averageScore
      })
    }

  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { message: 'Nu s-au putut încărca statisticile' },
      { status: 500 }
    )
  }
}
