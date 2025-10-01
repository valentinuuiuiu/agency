import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const jobs = await prisma.job.findMany({
      select: {
        id: true,
        title: true,
        company: true,
        location: true,
        category: true,
        contractType: true,
        isActive: true,
        createdAt: true,
        recruiter: {
          select: {
            name: true,
            email: true
          }
        },
        applications: {
          select: {
            id: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const formattedJobs = jobs.map(job => ({
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      type: job.contractType,
      status: job.isActive ? 'ACTIVE' : 'INACTIVE',
      createdAt: job.createdAt.toISOString(),
      applicationCount: job.applications.length,
      recruiterName: job.recruiter.name || 'Unknown'
    }))

    return NextResponse.json(formattedJobs)
  } catch (error) {
    console.error('Admin jobs fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
