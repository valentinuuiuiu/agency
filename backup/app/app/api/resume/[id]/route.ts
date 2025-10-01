
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { deleteFile } from '@/lib/s3'

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Nu ești autentificat' },
        { status: 401 }
      )
    }

    // Find resume and verify ownership
    const resume = await prisma.resume.findFirst({
      where: {
        id: id,
        userId: session.user.id
      }
    })

    if (!resume) {
      return NextResponse.json(
        { message: 'CV-ul nu a fost găsit' },
        { status: 404 }
      )
    }

    // Delete from S3
    await deleteFile(resume.cloudStoragePath)

    // Delete from database
    await prisma.resume.delete({
      where: { id: id }
    })

    return NextResponse.json({
      message: 'CV-ul a fost șters cu succes'
    })

  } catch (error) {
    console.error('Error deleting resume:', error)
    return NextResponse.json(
      { message: 'Nu s-a putut șterge CV-ul' },
      { status: 500 }
    )
  }
}
