
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const jobs = await prisma.job.findMany({
      where: { isActive: true },
      include: {
        recruiter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        _count: {
          select: { applications: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ jobs })
  } catch (error) {
    console.error('Error fetching jobs:', error)
    return NextResponse.json(
      { message: 'Nu s-au putut încărca locurile de muncă' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'RECRUITER') {
      return NextResponse.json(
        { message: 'Nu ai permisiunea să postezi locuri de muncă' },
        { status: 403 }
      )
    }

    const data = await request.json()

    // Validate required fields
    if (!data.title || !data.description || !data.category || !data.location || 
        !data.company || !data.contactEmail || !data.requirements) {
      return NextResponse.json(
        { message: 'Toate câmpurile obligatorii trebuie completate' },
        { status: 400 }
      )
    }

    const job = await prisma.job.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        location: data.location,
        company: data.company,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        salary: data.salary,
        workingHours: data.workingHours,
        contractType: data.contractType,
        languageRequirement: data.languageRequirement,
        experienceRequired: data.experienceRequired,
        seasonalWork: data.seasonalWork,
        housingProvided: data.housingProvided,
        transportProvided: data.transportProvided,
        requirements: data.requirements,
        benefits: data.benefits,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        recruiterId: session.user.id
      }
    })

    return NextResponse.json({ 
      message: 'Locul de muncă a fost postat cu succes',
      job 
    })

  } catch (error) {
    console.error('Error creating job:', error)
    return NextResponse.json(
      { message: 'Nu s-a putut posta locul de muncă' },
      { status: 500 }
    )
  }
}
