
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Nu ești autentificat' },
        { status: 401 }
      )
    }

    const application = await prisma.application.findUnique({
      where: {
        candidateId_jobId: {
          candidateId: session.user.id,
          jobId: jobId
        }
      }
    })

    return NextResponse.json({ 
      hasApplied: !!application,
      applicationId: application?.id || null
    })

  } catch (error) {
    console.error('Error checking application:', error)
    return NextResponse.json(
      { message: 'Eroare la verificarea aplicației' },
      { status: 500 }
    )
  }
}
