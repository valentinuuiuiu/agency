import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import * as z from 'zod'

const formSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  message: z.string().min(10).max(1000)
})

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL_1 || 'ionutbaltag3@gmail.com'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, message } = formSchema.parse(body)

    const transporter = createTransporter()

    // Verify transporter
    await transporter.verify()

    const mailOptions = {
      from: process.env.EMAIL_FROM || CONTACT_EMAIL,
      to: CONTACT_EMAIL,
      replyTo: email,
      subject: `Mesaj de contact de la ${name}`,
      text: `
Nume: ${name}
Email: ${email}
Mesaj: ${message}
      `,
      html: `
        <h2>Mesaj nou de contact</h2>
        <p><strong>Nume:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Mesaj:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    }

    await transporter.sendMail(mailOptions)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error sending email:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
