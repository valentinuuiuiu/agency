import React from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
// Import global styles; ensure TypeScript recognizes CSS modules
import './globals.css'
import { Providers } from './providers'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { getLocale, getMessages } from 'next-intl/server'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Locuri de Muncă Daneza - Silvicultură & Agricultură',
  description: 'Platforma de recrutare pentru românii care caută locuri de muncă în silvicultură și agricultură în Danemarca',
  keywords: 'locuri muncă Danemarca, silvicultură Danemarca, agricultură Danemarca, muncitori români'
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()
  const messages = await getMessages()
  const session = await getServerSession(authOptions)

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Providers messages={messages} locale={locale} session={session}>
          {children}
        </Providers>
      </body>
    </html>
  )

}
