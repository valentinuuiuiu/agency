import { Suspense } from 'react'
import { Metadata } from 'next'
import { AgencyDashboard } from '@/components/agency/agency-dashboard'

export const metadata: Metadata = {
  title: 'Agency Dashboard - Romanian-Danish Jobs',
  description: 'Manage your recruitment business across Europe',
}

export default function AgencyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AgencyDashboard />
    </Suspense>
  )
}
