import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'

// GET /api/agency/placements - List all placements for the agency owner
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'AGENCY_OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const recruiterId = session.user.id

    const placements = await prisma.placement.findMany({
      where: { recruiterId: recruiterId },
      include: {
        candidate: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        client: {
          select: { id: true, name: true, email: true, commissionRate: true }
        },
        job: {
          select: { id: true, title: true, company: true }
        }
      },
      orderBy: { placementDate: 'desc' }
    })

    const formattedPlacements = placements.map(placement => ({
      id: placement.id,
      candidate: {
        id: placement.candidate.id,
        name: `${placement.candidate.firstName} ${placement.candidate.lastName}`,
        email: placement.candidate.email
      },
      client: {
        id: placement.client.id,
        name: placement.client.name,
        email: placement.client.email,
        commissionRate: Number(placement.client.commissionRate)
      },
      job: {
        id: placement.job.id,
        title: placement.job.title,
        company: placement.job.company
      },
      country: placement.country,
      placementDate: placement.placementDate.toISOString().split('T')[0],
      startSalary: Number(placement.startSalary),
      commission: Number(placement.commission),
      status: placement.status,
      notes: placement.notes,
      createdAt: placement.createdAt.toISOString()
    }))

    return NextResponse.json(formattedPlacements)
  } catch (error) {
    console.error('Error fetching placements:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/agency/placements - Create a new placement
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'AGENCY_OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const recruiterId = session.user.id
    const body = await request.json()

    const { candidateId, clientId, jobId, country, placementDate, startSalary, status, notes } = body

    // Validate required fields
    if (!candidateId || !clientId || !jobId || !country || !placementDate || !startSalary) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify that candidate exists and is placed by this recruiter
    const candidate = await prisma.user.findFirst({
      where: {
        id: candidateId,
        placements: {
          some: {
            recruiterId: recruiterId
          }
        }
      }
    })

    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found or not managed by this recruiter' }, { status: 404 })
    }

    // Verify that client belongs to this recruiter
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        recruiterId: recruiterId
      }
    })

    if (!client) {
      return NextResponse.json({ error: 'Client not found or not managed by this recruiter' }, { status: 404 })
    }

    // Calculate commission based on client's commission rate
    const commission = Number(startSalary) * Number(client.commissionRate)

    const placement = await prisma.placement.create({
      data: {
        candidateId,
        clientId,
        jobId,
        recruiterId,
        country,
        placementDate: new Date(placementDate),
        startSalary: Number(startSalary),
        commission: commission,
        status: status || 'PLACED',
        notes
      },
      include: {
        candidate: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        client: {
          select: { id: true, name: true, email: true, commissionRate: true }
        },
        job: {
          select: { id: true, title: true, company: true }
        }
      }
    })

    return NextResponse.json({
      id: placement.id,
      candidate: {
        id: placement.candidate.id,
        name: `${placement.candidate.firstName} ${placement.candidate.lastName}`,
        email: placement.candidate.email
      },
      client: {
        id: placement.client.id,
        name: placement.client.name,
        email: placement.client.email,
        commissionRate: Number(placement.client.commissionRate)
      },
      job: {
        id: placement.job.id,
        title: placement.job.title,
        company: placement.job.company
      },
      country: placement.country,
      placementDate: placement.placementDate.toISOString().split('T')[0],
      startSalary: Number(placement.startSalary),
      commission: Number(placement.commission),
      status: placement.status,
      notes: placement.notes
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating placement:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
