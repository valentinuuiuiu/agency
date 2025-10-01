
"use client"
import React from 'react'
import type { Session } from 'next-auth'
import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'
import { useState, useEffect } from 'react'

export function SessionProvider({ children, session }: { children: React.ReactNode, session?: Session | null }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    )
  }

  // Pass children and optional session as props to NextAuthSessionProvider
  const Provider: any = NextAuthSessionProvider

  return (
    <Provider session={session}>
      {children}
    </Provider>
  )
}
