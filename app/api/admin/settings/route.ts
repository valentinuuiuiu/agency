import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'

interface SystemSettings {
  siteName: string
  siteDescription: string
  maintenanceMode: boolean
  registrationEnabled: boolean
  emailNotifications: boolean
  autoModeration: boolean
  maxJobsPerUser: number
  maxApplicationsPerDay: number
}

// Default settings
const defaultSettings: SystemSettings = {
  siteName: 'AI-Market.online',
  siteDescription: 'Professional recruitment agency specializing in agricultural and forestry jobs',
  maintenanceMode: false,
  registrationEnabled: true,
  emailNotifications: true,
  autoModeration: false,
  maxJobsPerUser: 10,
  maxApplicationsPerDay: 50
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // In a real app, you'd fetch from database
    // For now, return default settings
    return NextResponse.json(defaultSettings)
  } catch (error) {
    console.error('Admin settings fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const settings: SystemSettings = { ...defaultSettings, ...body }

    // In a real app, you'd save to database
    // For now, just validate and return
    if (typeof settings.maxJobsPerUser !== 'number' || settings.maxJobsPerUser < 1) {
      return NextResponse.json({ error: 'Invalid maxJobsPerUser value' }, { status: 400 })
    }

    if (typeof settings.maxApplicationsPerDay !== 'number' || settings.maxApplicationsPerDay < 1) {
      return NextResponse.json({ error: 'Invalid maxApplicationsPerDay value' }, { status: 400 })
    }

    // Here you would save to database
    console.log('Saving settings:', settings)

    return NextResponse.json({ success: true, settings })
  } catch (error) {
    console.error('Admin settings save error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
