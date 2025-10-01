'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Bot, Loader2, User, Send, CheckCircle, Clock, AlertCircle } from 'lucide-react'

interface AiTask {
  id: number
  text: string
  status: 'pending' | 'in-progress' | 'completed' | 'failed'
  result?: string
  error?: string
  createdAt: string
  completedAt?: string
}

export default function AdminAiTasksPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tasks, setTasks] = useState<AiTask[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentTask, setCurrentTask] = useState<AiTask | null>(null)

  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user.role !== 'ADMIN') {
      router.push('/')
      return
    }

    // Load existing tasks
    loadTasks()
  }, [session, status, router])

  const loadTasks = () => {
    // Mock existing tasks
    const mockTasks: AiTask[] = [
      {
        id: 1,
        text: 'Analyze top 5 most applied-for job categories this month',
        status: 'completed',
        result: 'Based on application data, the top categories are: 1. Construction (35%), 2. Agriculture (28%), 3. Manufacturing (18%), 4. IT (12%), 5. Logistics (7%)',
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        completedAt: new Date(Date.now() - 1000 * 60 * 25).toISOString()
      },
      {
        id: 2,
        text: 'Generate a summary of user feedback from the last 7 days',
        status: 'completed',
        result: 'User feedback summary: 85% positive feedback about job matching quality, 12% requests for more country options, 3% technical issues with CV upload. Overall satisfaction score: 4.2/5',
        createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        completedAt: new Date(Date.now() - 1000 * 60 * 55).toISOString()
      },
      {
        id: 3,
        text: 'Identify 10 candidate profiles with "welding" skills and "expert" experience',
        status: 'completed',
        result: 'Found 12 candidates with expert welding skills. Top matches: Mihai Popescu (95% match), Andrei Ionescu (92% match), Elena Dumitrescu (89% match). All have 5+ years experience and EU certifications.',
        createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
        completedAt: new Date(Date.now() - 1000 * 60 * 85).toISOString()
      }
    ]
    setTasks(mockTasks)
  }

  const handleAddTask = async () => {
    if (!input.trim()) return

    setIsLoading(true)
    const newTask: AiTask = {
      id: tasks.length + 1,
      text: input,
      status: 'in-progress',
      createdAt: new Date().toISOString()
    }

    setTasks(prev => [newTask, ...prev])
    setInput('')
    setCurrentTask(newTask)

    try {
      // Call real AI service for task processing
      const response = await fetch('/api/admin/ai-tasks/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: input })
      })

      if (response.ok) {
        const data = await response.json()
        setTasks(prev => prev.map(task =>
          task.id === newTask.id
            ? {
                ...task,
                status: 'completed',
                result: data.result,
                completedAt: new Date().toISOString()
              }
            : task
        ))
      } else {
        throw new Error('AI processing failed')
      }
    } catch (error) {
      setTasks(prev => prev.map(task =>
        task.id === newTask.id
          ? {
              ...task,
              status: 'failed',
              error: error instanceof Error ? error.message : 'AI processing failed',
              completedAt: new Date().toISOString()
            }
          : task
      ))
    } finally {
      setIsLoading(false)
      setCurrentTask(null)
    }
  }



  const getStatusIcon = (status: AiTask['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-gray-400" />
      case 'in-progress':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: AiTask['status']) => {
    const variants = {
      'pending': 'secondary',
      'in-progress': 'default',
      'completed': 'default',
      'failed': 'destructive'
    } as const

    const colors = {
      'pending': 'text-gray-600',
      'in-progress': 'text-blue-600',
      'completed': 'text-green-600',
      'failed': 'text-red-600'
    }

    return (
      <Badge variant={variants[status]} className={colors[status]}>
        {status.toUpperCase()}
      </Badge>
    )
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading AI tasks...</p>
        </div>
      </div>
    )
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-indigo-700 bg-clip-text text-transparent mb-2">
            AI Admin Assistant
          </h1>
          <p className="text-slate-600">AI-powered administrative tasks and insights</p>
        </div>

        {/* Task Input */}
        <Card className="mb-8 bg-white/60 backdrop-blur-sm border-white/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-6 w-6 text-indigo-600" />
              Ask AI Assistant
            </CardTitle>
            <CardDescription>
              Describe the administrative task you want the AI to perform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-3">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Examples:&#10;• Analyze user engagement trends&#10;• Generate monthly recruitment report&#10;• Find candidates with specific skills&#10;• Create job posting recommendations&#10;• Analyze platform performance metrics"
                  className="flex-1 min-h-[100px] bg-white/50 border-white/20"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleAddTask}
                  disabled={isLoading || !input.trim()}
                  className="self-end bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  {isLoading ? 'Processing...' : 'Send Task'}
                </Button>
              </div>

              {currentTask && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    <span className="font-medium text-blue-800">Processing your request...</span>
                  </div>
                  <p className="text-blue-600">{currentTask.text}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Task History */}
        <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-slate-600" />
              Task History
            </CardTitle>
            <CardDescription>
              Previous AI tasks and their results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tasks.length === 0 ? (
                <div className="text-center py-8">
                  <Bot className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No tasks yet. Ask the AI to perform an administrative task above.</p>
                </div>
              ) : (
                tasks.map((task) => (
                  <div key={task.id} className="border border-slate-200 rounded-lg p-4 bg-white/50 hover:bg-white/70 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        {getStatusIcon(task.status)}
                        <div className="flex-1">
                          <p className="font-medium text-slate-800 mb-1">{task.text}</p>
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <span>Created: {new Date(task.createdAt).toLocaleString()}</span>
                            {task.completedAt && (
                              <span>• Completed: {new Date(task.completedAt).toLocaleString()}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      {getStatusBadge(task.status)}
                    </div>

                    {task.result && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-green-800">Result:</span>
                        </div>
                        <p className="text-green-700 text-sm">{task.result}</p>
                      </div>
                    )}

                    {task.error && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="h-4 w-4 text-red-600" />
                          <span className="font-medium text-red-800">Error:</span>
                        </div>
                        <p className="text-red-700 text-sm">{task.error}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-800 group-hover:text-blue-700 transition-colors">
                <Bot className="h-5 w-5 text-blue-600" />
                User Analytics
              </CardTitle>
              <CardDescription className="text-slate-600">Generate user behavior insights</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
                onClick={() => setInput('Analyze user engagement patterns and provide insights on platform usage trends')}
              >
                Generate Report
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-800 group-hover:text-green-700 transition-colors">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Job Market Analysis
              </CardTitle>
              <CardDescription className="text-slate-600">Analyze job posting trends</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full border-green-200 text-green-700 hover:bg-green-50"
                onClick={() => setInput('Analyze current job market trends and identify the most in-demand skills and locations')}
              >
                Analyze Market
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-800 group-hover:text-purple-700 transition-colors">
                <AlertCircle className="h-5 w-5 text-purple-600" />
                System Health Check
              </CardTitle>
              <CardDescription className="text-slate-600">Monitor system performance</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full border-purple-200 text-purple-700 hover:bg-purple-50"
                onClick={() => setInput('Perform a comprehensive system health check and identify any potential issues or optimizations')}
              >
                Check Health
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
