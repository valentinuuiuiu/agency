
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { uploadFile } from '@/lib/s3'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Nu ești autentificat' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('resume') as File

    if (!file) {
      return NextResponse.json(
        { message: 'Niciun fișier nu a fost încărcat' },
        { status: 400 }
      )
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { message: 'Doar fișierele PDF sunt acceptate' },
        { status: 400 }
      )
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { message: 'Fișierul este prea mare. Limita este de 10MB' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())
    
    // Generate unique filename
    const timestamp = Date.now()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = `resumes/${session.user.id}/${timestamp}-${sanitizedName}`

    // Upload to S3
    const cloudStoragePath = await uploadFile(buffer, fileName)

    // Save to database
    const resume = await prisma.resume.create({
      data: {
        originalName: file.name,
        cloudStoragePath,
        userId: session.user.id
      }
    })

    return NextResponse.json({
      message: 'CV-ul a fost încărcat cu succes',
      resume
    })

  } catch (error) {
    console.error('Error uploading resume:', error)
    return NextResponse.json(
      { message: 'Nu s-a putut încărca CV-ul' },
      { status: 500 }
    )
  }
}
