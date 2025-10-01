import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { AdminMCPServer } from '@/lib/admin-mcp-server'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { task } = await request.json()

    if (!task || typeof task !== 'string' || task.trim().length === 0) {
      return NextResponse.json({ error: 'Task is required' }, { status: 400 })
    }

    const adminMCP = AdminMCPServer.getInstance()

    // Determine which tool to use based on the task content
    let toolName = 'analyze_analytics'
    let toolArgs: any = { type: 'platform_performance' }

    const taskLower = task.toLowerCase()

    if (taskLower.includes('user') && (taskLower.includes('engagement') || taskLower.includes('behavior') || taskLower.includes('analytic'))) {
      toolName = 'analyze_analytics'
      toolArgs = { type: 'user_engagement' }
    } else if (taskLower.includes('job') && (taskLower.includes('market') || taskLower.includes('posting') || taskLower.includes('trend'))) {
      toolName = 'analyze_analytics'
      toolArgs = { type: 'job_market' }
    } else if (taskLower.includes('system') && (taskLower.includes('health') || taskLower.includes('performance') || taskLower.includes('check'))) {
      toolName = 'check_system_health'
      toolArgs = {}
    } else if (taskLower.includes('log') || taskLower.includes('error') || taskLower.includes('activity')) {
      toolName = 'get_logs'
      toolArgs = { level: 'all', limit: 50 }
    } else if (taskLower.includes('stats') || taskLower.includes('dashboard') || taskLower.includes('overview')) {
      toolName = 'get_admin_stats'
      toolArgs = {}
    } else if (taskLower.includes('scrape') || taskLower.includes('crawler') || taskLower.includes('harvest')) {
      toolName = 'run_scraper'
      toolArgs = { country: 'denmark', maxPages: 50 }
    }

    // Execute the appropriate tool
    const result = await adminMCP.executeTool(toolName, toolArgs)

    // Format the result for display
    let formattedResult = ''

    if (toolName === 'get_admin_stats') {
      formattedResult = `📊 **Admin Dashboard Statistics**

👥 **Total Users:** ${result.totalUsers}
💼 **Total Jobs:** ${result.totalJobs}
📋 **Total Applications:** ${result.totalApplications}
📄 **Total Resumes:** ${result.totalResumes}

**Summary:** Platform shows healthy growth with ${result.totalUsers} registered users and ${result.totalJobs} active job postings.`
    } else if (toolName === 'analyze_analytics') {
      formattedResult = `📈 **Analytics Report**

**User Growth:** ${result.userGrowth?.length || 0} data points analyzed
**Job Categories:** ${result.jobStats?.length || 0} categories tracked
**Application Trends:** ${result.applicationTrends?.length || 0} days of data
**Top Locations:** ${result.topLocations?.length || 0} locations identified

**Key Insights:**
- Total Users: ${result.summary?.totalUsers || 0}
- Total Jobs: ${result.summary?.totalJobs || 0}
- Conversion Rate: ${result.summary?.conversionRate || 0}%`
    } else if (toolName === 'check_system_health') {
      formattedResult = `🔍 **System Health Check**

**Overall Status:** ${result.overall}

**Component Status:**
- Database: ${result.components?.database?.status || 'Unknown'}
- API: ${result.components?.api?.status || 'Unknown'}
- Scraping: ${result.components?.scraping?.status || 'Unknown'}
- AI Service: ${result.components?.ai_service?.status || 'Unknown'}

**Timestamp:** ${result.timestamp}`
    } else if (toolName === 'get_logs') {
      formattedResult = `📋 **System Logs**

**Total Logs Retrieved:** ${result.length}

**Recent Activity:**
${result.slice(0, 5).map((log: any) => `• [${log.level}] ${log.message} (${new Date(log.timestamp).toLocaleString()})`).join('\n')}

**Log Sources:** ${[...new Set(result.map((log: any) => log.source))].join(', ')}`
    } else if (toolName === 'run_scraper') {
      formattedResult = `🔍 **Scraping Job Started**

**Job Details:**
- Country: ${result.job?.country || 'Unknown'}
- Industry: ${result.job?.industry || 'General'}
- Max Pages: ${result.job?.maxPages || 50}
- Estimated Duration: ${result.job?.estimatedDuration || 'Unknown'}

**Status:** ${result.job?.status || 'Started'}
**Started At:** ${result.job?.startedAt ? new Date(result.job.startedAt).toLocaleString() : 'Now'}`
    } else {
      formattedResult = `✅ **Task Completed**

The requested administrative task has been processed successfully.

**Result Summary:**
${JSON.stringify(result, null, 2)}`
    }

    return NextResponse.json({
      success: true,
      result: formattedResult,
      task: task,
      toolUsed: toolName
    })

  } catch (error) {
    console.error('AI Task Processing Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to process AI task',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
