import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'AGENCY_OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const recruiterId = session.user.id

    // Get current month for filtering
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Calculate KPIs
    const totalRevenue = await prisma.placement.aggregate({
      where: {
        recruiterId: recruiterId,
        placementDate: {
          gte: startOfMonth
        }
      },
      _sum: {
        commission: true
      }
    })

    const totalPlacements = await prisma.placement.count({
      where: {
        recruiterId: recruiterId,
        placementDate: {
          gte: startOfMonth
        }
      }
    })

    const activeClients = await prisma.client.count({
      where: {
        recruiterId: recruiterId,
        status: 'ACTIVE'
      }
    })

    // Calculate monthly growth (comparing this month to last month)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    const lastMonthRevenue = await prisma.placement.aggregate({
      where: {
        recruiterId: recruiterId,
        placementDate: {
          gte: startOfLastMonth,
          lte: endOfLastMonth
        }
      },
      _sum: {
        commission: true
      }
    })

    const currentRevenue = Number(totalRevenue._sum.commission || 0)
    const previousRevenue = Number(lastMonthRevenue._sum.commission || 0)
    const monthlyGrowth = previousRevenue > 0
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
      : 0

    // Get recent placements
    const recentPlacements = await prisma.placement.findMany({
      where: { recruiterId: recruiterId },
      include: {
        candidate: {
          select: { name: true, firstName: true, lastName: true }
        },
        job: {
          select: { title: true, company: true }
        }
      },
      orderBy: { placementDate: 'desc' },
      take: 5
    }).then(placements =>
      placements.map(p => ({
        id: p.id,
        candidateName: `${p.candidate.firstName} ${p.candidate.lastName}`,
        companyName: p.job.company,
        country: p.country,
        placementDate: p.placementDate.toISOString().split('T')[0],
        commission: Number(p.commission),
        status: p.status
      }))
    )

    // Revenue by country
    const revenueByCountry = await prisma.placement.groupBy({
      by: ['country'],
      where: { recruiterId: recruiterId },
      _sum: { commission: true },
      orderBy: { _sum: { commission: 'desc' } }
    })

    // Get lead statistics
    const totalLeads = await prisma.companyLead.count()
    const newLeads = await prisma.companyLead.count({
      where: { status: 'NEW' }
    })

    const dashboardData = {
      kpis: {
        totalRevenue: Number(currentRevenue),
        totalPlacements,
        activeClients,
        monthlyGrowth: Number(monthlyGrowth.toFixed(1))
      },
      revenueByCountry: revenueByCountry.map(r => ({
        country: r.country,
        revenue: Number(r._sum.commission || 0)
      })),
      recentPlacements,
      leadStats: {
        totalLeads,
        newLeads,
        conversionRate: totalLeads > 0 ? ((activeClients / totalLeads) * 100).toFixed(1) : 0
      }
    }

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
