
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'RECRUITER') {
      return NextResponse.json(
        { message: 'Nu ai permisiunea să modifici statusul aplicațiilor' },
        { status: 403 }
      )
    }

    const { status } = await request.json()

    const validStatuses = ['PENDING', 'REVIEWING', 'INTERVIEWED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { message: 'Status invalid' },
        { status: 400 }
      )
    }

    // Verify application belongs to recruiter's job
    const application = await prisma.application.findFirst({
      where: {
        id: id,
        job: {
          recruiterId: session.user.id
        }
      }
    })

    if (!application) {
      return NextResponse.json(
        { message: 'Aplicația nu a fost găsită' },
        { status: 404 }
      )
    }

    const updatedApplication = await prisma.application.update({
      where: { id: id },
      data: { status }
    })

    return NextResponse.json({
      message: 'Statusul a fost actualizat cu succes',
      application: updatedApplication
    })

  } catch (error) {
    console.error('Error updating application status:', error)
    return NextResponse.json(
      { message: 'Nu s-a putut actualiza statusul' },
      { status: 500 }
    )
  }
}
