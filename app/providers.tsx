"use client"

import React from 'react'
import { NextIntlClientProvider } from 'next-intl'
import { ThemeProvider } from '@/components/theme-provider'
import { SessionProvider } from '@/components/session-provider'
import { Toaster } from '@/components/ui/toaster'
import FloatingChatbot from '@/components/chatbot/floating-chatbot'

interface Props {
  children: React.ReactNode
  messages: any
  locale: string
  session?: any
}

export function Providers({ children, messages, locale, session }: Props) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <NextIntlClientProvider locale={locale} messages={messages}>
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </NextIntlClientProvider>
      <Toaster />
      <FloatingChatbot />
    </ThemeProvider>
  )
}
