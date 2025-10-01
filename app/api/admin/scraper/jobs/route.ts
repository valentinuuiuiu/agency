import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'

// Mock scraping jobs data
const mockScrapingJobs = [
  {
    id: '1',
    name: 'Danish Farm Jobs',
    status: 'COMPLETED',
    progress: 100,
    totalUrls: 25,
    scrapedUrls: 25,
    startTime: '2024-01-15T10:00:00Z',
    endTime: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    name: 'German Agriculture',
    status: 'RUNNING',
    progress: 65,
    totalUrls: 40,
    scrapedUrls: 26,
    startTime: '2024-01-15T11:00:00Z'
  }
]

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json(mockScrapingJobs)
  } catch (error) {
    console.error('Admin scraper jobs fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
