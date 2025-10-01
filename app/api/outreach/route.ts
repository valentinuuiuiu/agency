import { NextRequest, NextResponse } from 'next/server'
import CompanyOutreachService from '@/lib/company-outreach-agents'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, campaignId, countries, minScore, leadIds } = body
    const outreachService = CompanyOutreachService.getInstance()

    switch (action) {
      case 'generate-leads': {
        console.log('🎯 Starting lead generation...')

        const leads = await outreachService.generateLeads(
          countries || ['denmark', 'germany', 'netherlands', 'france'],
          minScore || 70
        )

        console.log(`✅ Generated ${leads.length} qualified leads`)
        return NextResponse.json({
          success: true,
          data: {
            leads,
            totalCount: leads.length,
            countries: countries || ['denmark', 'germany', 'netherlands', 'france'],
            minScore: minScore || 70
          }
        })
      }

      case 'execute-outreach': {
        if (!campaignId) {
          return NextResponse.json({
            success: false,
            error: 'Campaign ID is required for outreach execution'
          }, { status: 400 })
        }

        // Get qualified leads by campaign or from request
        const campaignLeads = leadIds ?
          (await outreachService.generateLeads()).filter(lead => leadIds.includes(lead.id)) :
          await outreachService.generateLeads()

        if (campaignLeads.length === 0) {
          return NextResponse.json({
            success: false,
            error: 'No leads found for outreach campaign'
          }, { status: 404 })
        }

        console.log(`🚀 Executing outreach campaign ${campaignId} with ${campaignLeads.length} leads`)

        const outreachResults = await outreachService.executeOutreach(campaignId, campaignLeads)

        const successCount = outreachResults.filter(result => result.success).length
        const totalContacts = outreachResults.length
        const successRate = totalContacts > 0 ? (successCount / totalContacts * 100).toFixed(1) : '0'

        console.log(`📈 Outreach completed: ${successCount}/${totalContacts} successful (${successRate}%)`)

        return NextResponse.json({
          success: true,
          data: {
            campaignId,
            results: outreachResults,
            stats: {
              totalContacts,
              successfulContacts: successCount,
              successRate: `${successRate}%`,
              failedContacts: totalContacts - successCount
            }
          }
        })
      }

      case 'get-outreach-stats':
        // This would normally fetch from database
        const stats = {
          totalLeads: 247,
          contactedCompanies: 98,
          successfulOutreach: 45,
          conversionRate: '18.2%',
          avgResponseTime: '3.2 days',
          topIndustries: [
            { industry: 'construction', leads: 67, successRate: '22%' },
            { industry: 'manufacturing', leads: 58, successRate: '19%' },
            { industry: 'healthcare', leads: 43, successRate: '15%' },
            { industry: 'logistics', leads: 39, successRate: '12%' },
            { industry: 'it', leads: 28, successRate: '25%' }
          ],
          recentActivity: [
            { company: 'Tech Solutions GmbH', status: 'contacted', date: new Date() },
            { company: 'Construction Partners BV', status: 'qualified', date: new Date(Date.now() - 86400000) },
            { company: 'Healthcare Systems FR', status: 'responded', date: new Date(Date.now() - 172800000) }
          ]
        }

        return NextResponse.json({
          success: true,
          data: stats
        })

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Supported actions: generate-leads, execute-outreach, get-outreach-stats'
        }, { status: 400 })
    }

  } catch (error) {
    console.error('Outreach API Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')

  if (action === 'health-check') {
    try {
      const outreachService = CompanyOutreachService.getInstance()

      // Test basic functionality
      const testResult = await outreachService.generateLeads(['denmark'], 90)

      return NextResponse.json({
        success: true,
        status: 'healthy',
        data: {
          service: 'CompanyOutreachService',
          testLeadsGenerated: testResult.length,
          timestamp: new Date().toISOString()
        }
      })
    } catch (error) {
      return NextResponse.json({
        success: false,
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Health check failed'
      }, { status: 503 })
    }
  }

  if (action === 'available-countries') {
    const countries = [
      {
        code: 'denmark',
        name: 'Denmark',
        flag: '🇩🇰',
        industries: ['agriculture', 'manufacturing', 'construction', 'forestry', 'logistics', 'hospitality'],
        activeJobs: 500,
        avgSalary: '€2,800'
      },
      {
        code: 'germany',
        name: 'Germany',
        flag: '🇩🇪',
        industries: ['construction', 'manufacturing', 'engineering', 'logistics', 'healthcare', 'retail'],
        activeJobs: 2500,
        avgSalary: '€3,200'
      },
      {
        code: 'netherlands',
        name: 'Netherlands',
        flag: '🇳🇱',
        industries: ['greenhouse', 'technology', 'logistics', 'manufacturing', 'it', 'hospitality'],
        activeJobs: 1800,
        avgSalary: '€2,900'
      },
      {
        code: 'france',
        name: 'France',
        flag: '🇫🇷',
        industries: ['construction', 'manufacturing', 'healthcare', 'hospitality', 'logistics', 'transportation'],
        activeJobs: 1200,
        avgSalary: '€2,600'
      }
    ]

    return NextResponse.json({
      success: true,
      data: {
        countries,
        totalCountries: countries.length,
        totalIndustries: [...new Set(countries.flatMap(c => c.industries))].length,
        totalJobs: countries.reduce((sum, c) => sum + c.activeJobs, 0)
      }
    })
  }

  return NextResponse.json({
    success: false,
    error: 'Invalid or missing action parameter. Try: health-check, available-countries'
  }, { status: 400 })
}
