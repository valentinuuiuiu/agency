import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'

// GET /api/agency/leads - List all leads
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'AGENCY_OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const leads = await prisma.companyLead.findMany({
      include: {
        convertedClient: {
          select: {
            id: true,
            name: true,
            status: true
          }
        }
      },
      orderBy: [
        { status: 'asc' }, // NEW first, then CONTACTED, etc.
        { fitScore: 'desc' }, // High fit score first
        { createdAt: 'desc' }
      ]
    });

    const formattedLeads = leads.map(lead => ({
      id: lead.id,
      name: lead.name,
      website: lead.website,
      country: lead.country,
      industry: lead.industry,
      email: lead.email,
      phone: lead.phone,
      contactPerson: lead.contactPerson,
      size: lead.size,
      status: lead.status,
      fitScore: lead.fitScore,
      leadType: lead.leadType,
      contactedAt: lead.contactedAt?.toISOString(),
      lastContact: lead.lastContact?.toISOString(),
      openPositions: lead.openPositions,
      paysRelocation: lead.paysRelocation,
      requiresLanguage: lead.requiresLanguage,
      visaHelp: lead.visaHelp,
      housingHelp: lead.housingHelp,
      notes: lead.notes,
      convertedToClient: lead.convertedClient,
      createdAt: lead.createdAt.toISOString()
    }))

    return NextResponse.json(formattedLeads)
  } catch (error) {
    console.error('Error fetching leads:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/agency/leads - Create a manual lead (not from scraping)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'AGENCY_OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const {
      name,
      website,
      country,
      industry,
      email,
      phone,
      contactPerson,
      notes,
      fitScore
    } = body

    // Validate required fields
    if (!name || !website || !country || !industry) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if lead with this website already exists
    const existingLead = await prisma.companyLead.findUnique({
      where: { website: website }
    })

    if (existingLead) {
      return NextResponse.json({ error: 'Lead with this website already exists' }, { status: 409 })
    }

    const lead = await prisma.companyLead.create({
      data: {
        name,
        website,
        country,
        industry,
        email,
        phone,
        contactPerson,
        notes,
        fitScore: fitScore || 50, // Default fit score
        leadType: 'PAYS_RELOC', // Default for manual entries
        status: 'NEW'
      }
    })

    return NextResponse.json(lead, { status: 201 })
  } catch (error) {
    console.error('Error creating lead:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
