import { NextResponse } from 'next/server'

// This is a mock implementation. In a real app, you'd use a service like Resend or Nodemailer
// to send an email. The contact details would be pulled from environment variables.

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, message } = body

    if (!name || !email || !message) {
      return NextResponse.json({ message: 'Lipsesc câmpuri obligatorii' }, { status: 400 })
    }

    // In a real app, you would get these from process.env
    const contactEmail1 = process.env.NEXT_PUBLIC_CONTACT_EMAIL_1
    const contactEmail2 = process.env.NEXT_PUBLIC_CONTACT_EMAIL_2

    console.log('--- New Contact Form Submission ---')
    console.log(`Name: ${name}`)
    console.log(`Email: ${email}`)
    console.log(`Message: ${message}`)
    console.log(`Would be sent to: ${contactEmail1}, ${contactEmail2}`)
    console.log('------------------------------------')

    // Simulate sending email
    await new Promise(resolve => setTimeout(resolve, 1000))

    return NextResponse.json({ message: 'Mesaj trimis cu succes!' })
  } catch (error) {
    console.error('Error in contact API:', error)
    return NextResponse.json({ message: 'Eroare la procesarea cererii' }, { status: 500 })
  }
}
