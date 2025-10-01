import React from 'react'
import AdminAiTasks from '@/components/admin-ai-tasks'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function AiTasksPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Admin AI Dashboard</CardTitle>
          <CardDescription>
            Use the DART assistant to perform complex queries and administrative tasks.
          </CardDescription>
        </CardHeader>
      </Card>
      <AdminAiTasks />
    </div>
  )
}
