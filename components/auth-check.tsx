
'use client'

import { useSession } from 'next-auth/react'
import Dashboard from '@/components/dashboard'
import LandingPage from '@/components/landing-page'

export default function AuthCheck() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (session) {
    return <Dashboard />
  }

  return <LandingPage />
}
