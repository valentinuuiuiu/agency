import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'

// GET /api/agency/clients - List all clients for the agency owner
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'AGENCY_OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const recruiterId = session.user.id

    const clients = await prisma.client.findMany({
      where: { recruiterId: recruiterId },
      include: {
        placements: {
          select: {
            id: true,
            placementDate: true,
            commission: true,
            status: true,
            candidate: {
              select: { firstName: true, lastName: true }
            }
          },
          orderBy: { placementDate: 'desc' },
          take: 3
        },
        _count: {
          select: { placements: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const formattedClients = clients.map(client => ({
      id: client.id,
      name: client.name,
      country: client.country,
      industry: client.industry,
      contactPerson: client.contactPerson,
      email: client.email,
      phone: client.phone,
      status: client.status,
      commissionRate: Number(client.commissionRate),
      website: client.website,
      address: client.address,
      totalPlacements: client._count.placements,
      totalRevenue: client.placements.reduce((sum, p) => sum + Number(p.commission), 0),
      recentPlacements: client.placements.map(p => ({
        id: p.id,
        candidateName: `${p.candidate.firstName} ${p.candidate.lastName}`,
        placementDate: p.placementDate.toISOString().split('T')[0],
        commission: Number(p.commission),
        status: p.status
      })),
      createdAt: client.createdAt.toISOString()
    }))

    return NextResponse.json(formattedClients)
  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/agency/clients - Create a new client
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'AGENCY_OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const recruiterId = session.user.id
    const body = await request.json()

    const { name, country, industry, contactPerson, email, phone, website, address, commissionRate } = body

    // Validate required fields
    if (!name || !country || !industry || !contactPerson || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if client with this email already exists for this recruiter
    const existingClient = await prisma.client.findFirst({
      where: {
        email: email,
        recruiterId: recruiterId
      }
    })

    if (existingClient) {
      return NextResponse.json({ error: 'Client with this email already exists' }, { status: 409 })
    }

    const client = await prisma.client.create({
      data: {
        name,
        country,
        industry,
        contactPerson,
        email,
        phone,
        website,
        address,
        commissionRate: commissionRate || 0.15, // Default 15%
        recruiterId: recruiterId
      }
    })

    return NextResponse.json(client, { status: 201 })
  } catch (error) {
    console.error('Error creating client:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
