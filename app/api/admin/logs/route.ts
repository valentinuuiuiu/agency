import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'

// Mock logs data
const mockLogs = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
    level: 'INFO',
    message: 'User login successful',
    source: 'auth',
    userId: 'user_123',
    metadata: { ip: '192.168.1.100', userAgent: 'Mozilla/5.0...' }
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
    level: 'WARN',
    message: 'Failed login attempt detected',
    source: 'auth',
    metadata: { ip: '10.0.0.1', attempts: 3 }
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    level: 'ERROR',
    message: 'Database connection timeout',
    source: 'database',
    metadata: { query: 'SELECT * FROM users', timeout: '30s' }
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 minutes ago
    level: 'INFO',
    message: 'Scraping job completed successfully',
    source: 'scraper',
    metadata: { jobId: 'job_123', urlsScraped: 25, duration: '5m 30s' }
  },
  {
    id: '5',
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
    level: 'DEBUG',
    message: 'AI model processing request',
    source: 'api',
    metadata: { model: 'gemma-3n-e4b-it', tokens: 150 }
  }
]

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const level = searchParams.get('level') || 'all'
    const source = searchParams.get('source') || 'all'
    const search = searchParams.get('search') || ''

    let filteredLogs = mockLogs

    // Filter by level
    if (level !== 'all') {
      filteredLogs = filteredLogs.filter(log => log.level === level)
    }

    // Filter by source
    if (source !== 'all') {
      filteredLogs = filteredLogs.filter(log => log.source === source)
    }

    // Filter by search term
    if (search) {
      filteredLogs = filteredLogs.filter(log =>
        log.message.toLowerCase().includes(search.toLowerCase()) ||
        log.source.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Sort by timestamp (newest first)
    filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return NextResponse.json(filteredLogs)
  } catch (error) {
    console.error('Admin logs fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
