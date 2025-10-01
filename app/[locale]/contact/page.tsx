import React from 'react'
import { Mail, Phone } from 'lucide-react'
import ContactForm from '@/components/contact-form'
import { useTranslations } from 'next-intl'

const CONTACT_EMAIL_1 = process.env.NEXT_PUBLIC_CONTACT_EMAIL_1 || 'ionutbaltag3@gmail.com'
const CONTACT_EMAIL_2 = process.env.NEXT_PUBLIC_CONTACT_EMAIL_2 || 'work5@dr.dk'
const CONTACT_PHONE = process.env.NEXT_PUBLIC_CONTACT_PHONE || '+40786538708'

export default function ContactPage() {
  const t = useTranslations('contact')
  
  return (
    <div className="min-h-screen bg-white py-20">
      <div className="container mx-auto max-w-6xl px-4">
        <h1 className="text-3xl font-bold mb-6">{t('title')}</h1>
        <p className="mb-6 text-gray-700">{t('description')}</p>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-gray-700" />
              <a href={`mailto:${CONTACT_EMAIL_1}`} className="underline">{CONTACT_EMAIL_1}</a>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-gray-700" />
              <a href={`mailto:${CONTACT_EMAIL_2}`} className="underline">{CONTACT_EMAIL_2}</a>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-gray-700" />
              <a href={`tel:${CONTACT_PHONE}`} className="underline">{CONTACT_PHONE}</a>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-4">{t('formTitle')}</h2>
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  )
}
