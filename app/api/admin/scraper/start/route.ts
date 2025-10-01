import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { urls, maxPages, delay, jobName } = body

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ error: 'URLs array is required' }, { status: 400 })
    }

    if (typeof maxPages !== 'number' || maxPages < 1 || maxPages > 200) {
      return NextResponse.json({ error: 'maxPages must be between 1 and 200' }, { status: 400 })
    }

    if (typeof delay !== 'number' || delay < 500 || delay > 5000) {
      return NextResponse.json({ error: 'delay must be between 500 and 5000 ms' }, { status: 400 })
    }

    // In a real app, you'd start the scraping job here
    // For now, simulate a successful start
    const jobId = `job_${Date.now()}`
    const newJob = {
      id: jobId,
      name: jobName || 'Scraping Job',
      status: 'RUNNING',
      progress: 0,
      totalUrls: urls.length,
      scrapedUrls: 0,
      startTime: new Date().toISOString()
    }

    console.log('Starting scraping job:', newJob)

    return NextResponse.json({
      success: true,
      jobId,
      message: 'Scraping job started successfully'
    })
  } catch (error) {
    console.error('Admin scraper start error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
