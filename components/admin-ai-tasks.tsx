'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bot, Loader2, User } from 'lucide-react'

interface AiTask {
  id: number
  text: string
  status: 'pending' | 'in-progress' | 'completed'
}

export default function AdminAiTasks() {
  const [tasks, setTasks] = useState<AiTask[]>([
    { id: 1, text: 'Analyze top 5 most applied-for job categories this month', status: 'pending' },
    { id: 2, text: 'Generate a summary of user feedback from the last 7 days', status: 'pending' },
    { id: 3, text: 'Identify 10 candidate profiles with "welding" skills and "expert" experience', status: 'completed' },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleAddTask = async () => {
    if (!input.trim()) return
    setIsLoading(true)

    const newTask: AiTask = {
      id: tasks.length + 1,
      text: input,
      status: 'in-progress',
    }
    setTasks(prev => [...prev, newTask])
    setInput('')

    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000))

    setTasks(prev =>
      prev.map(task =>
        task.id === newTask.id ? { ...task, status: 'completed' } : task
      )
    )
    setIsLoading(false)
  }

  const getStatusIcon = (status: AiTask['status']) => {
    switch (status) {
      case 'pending':
        return <span className="text-gray-400">⚪️ Pending</span>
      case 'in-progress':
        return <span className="text-blue-500 flex items-center gap-2"><Loader2 className="animate-spin" /> In Progress</span>
      case 'completed':
        return <span className="text-green-500">🟢 Completed</span>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot />
          AI Admin Assistant (DART)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask the AI to perform a task..."
              onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
              disabled={isLoading}
            />
            <Button onClick={handleAddTask} disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : 'Add Task'}
            </Button>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">Task List</h3>
            {tasks.map(task => (
              <div key={task.id} className="flex items-center justify-between p-2 border rounded-md">
                <div className="flex items-center gap-2">
                  <User size={16} />
                  <span>{task.text}</span>
                </div>
                {getStatusIcon(task.status)}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
