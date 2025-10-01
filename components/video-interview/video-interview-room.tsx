'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Mic, MicOff, Video, VideoOff, Phone, PhoneOff, MessageSquare, FileText } from 'lucide-react'

interface InterviewQuestion {
  id: string
  question: string
  expectedAnswer?: string
  aiAssessment?: string
  candidateResponse?: string
  score?: number
  timestamp?: Date
}

interface InterviewSession {
  id: string
  meetingId: string
  meetingUrl: string
  scheduledAt: Date
  duration: number
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
  recordingUrl?: string
  aiTranscription?: string
  aiNotes?: string
  aiScore?: number
  interviewerNotes?: string
  candidateFeedback?: string
}

interface VideoInterviewRoomProps {
  interviewId: string
  userId: string
  userType: 'candidate' | 'interviewer'
  onComplete?: (notes: string) => void
}

export function VideoInterviewRoom({ interviewId, userId, userType, onComplete }: VideoInterviewRoomProps) {
  const [session, setSession] = useState<InterviewSession | null>(null)
  const [questions, setQuestions] = useState<InterviewQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isMicOn, setIsMicOn] = useState(true)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [candidateResponse, setCandidateResponse] = useState('')
  const [interviewerNotes, setInterviewerNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const wsRef = useRef<WebSocket | null>(null)

  // Initialize interview session
  useEffect(() => {
    loadInterviewSession()
    loadQuestions()

    // Set up WebSocket for real-time communication
    setupWebSocket()

    // Set up timer if interview is in progress
    if (session?.status === 'in_progress') {
      startTimer()
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [interviewId])

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (session?.status === 'in_progress' && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleInterviewComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [session?.status, timeRemaining])

  const loadInterviewSession = async () => {
    try {
      const response = await fetch(`/api/interviews?action=get_session&interviewId=${interviewId}&userId=${userId}`)
      const data = await response.json()

      if (data.success) {
        setSession(data.session)
        if (data.session.status === 'in_progress') {
          setTimeRemaining(data.session.duration * 60) // Convert minutes to seconds
        }
      }
    } catch (error) {
      console.error('Failed to load interview session:', error)
    }
  }

  const loadQuestions = async () => {
    try {
      const response = await fetch(`/api/interviews?action=get_questions&interviewId=${interviewId}&userId=${userId}`)
      const data = await response.json()

      if (data.success) {
        setQuestions(data.questions)
      }
    } catch (error) {
      console.error('Failed to load questions:', error)
    }
  }

  const setupWebSocket = () => {
    const ws = new WebSocket(`ws://localhost:3001?userId=${userId}&userType=${userType}`)

    ws.onopen = () => {
      setIsConnected(true)
      console.log('Connected to interview WebSocket')
    }

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data)
      handleWebSocketMessage(message)
    }

    ws.onclose = () => {
      setIsConnected(false)
      console.log('Disconnected from interview WebSocket')
    }

    wsRef.current = ws
  }

  const handleWebSocketMessage = (message: any) => {
    switch (message.type) {
      case 'question_asked':
        // Interviewer asked a new question
        break
      case 'response_received':
        // Candidate submitted a response
        break
      case 'interview_ended':
        handleInterviewComplete()
        break
    }
  }

  const startTimer = () => {
    if (session) {
      setTimeRemaining(session.duration * 60) // Convert minutes to seconds
    }
  }

  const handleInterviewComplete = async () => {
    if (userType === 'interviewer' && interviewerNotes) {
      try {
        await fetch('/api/interviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'complete',
            interviewId,
            interviewerNotes
          })
        })

        if (onComplete) {
          onComplete(interviewerNotes)
        }
      } catch (error) {
        console.error('Failed to complete interview:', error)
      }
    }
  }

  const submitQuestionResponse = async () => {
    if (!candidateResponse.trim() || !questions[currentQuestionIndex]) return

    setIsSubmitting(true)
    try {
      await fetch('/api/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit_response',
          interviewId,
          questionId: questions[currentQuestionIndex].id,
          response: candidateResponse,
          candidateId: userId
        })
      })

      // Update local state
      const updatedQuestions = [...questions]
      updatedQuestions[currentQuestionIndex].candidateResponse = candidateResponse
      updatedQuestions[currentQuestionIndex].timestamp = new Date()
      setQuestions(updatedQuestions)

      setCandidateResponse('')

      // Move to next question
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1)
      }
    } catch (error) {
      console.error('Failed to submit response:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading interview session...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl">
                  Video Interview {session.status === 'in_progress' && '(Live)'}
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {session.status === 'in_progress' && `Time remaining: ${formatTime(timeRemaining)}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={session.status === 'in_progress' ? 'default' : 'secondary'}>
                  {session.status.replace('_', ' ').toUpperCase()}
                </Badge>
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Area */}
        <div className="lg:col-span-2">
          <Card className="h-[600px]">
            <CardContent className="p-4 h-full">
              <div className="relative h-full bg-black rounded-lg overflow-hidden">
                {/* Main video stream */}
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                  muted={!isMicOn}
                />

                {/* Local video (picture-in-picture) */}
                <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden">
                  <video
                    ref={localVideoRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    playsInline
                    muted
                  />
                </div>

                {/* Controls overlay */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                  <Button
                    variant={isMicOn ? 'default' : 'destructive'}
                    size="sm"
                    onClick={() => setIsMicOn(!isMicOn)}
                    className="rounded-full w-12 h-12"
                  >
                    {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                  </Button>

                  <Button
                    variant={isVideoOn ? 'default' : 'destructive'}
                    size="sm"
                    onClick={() => setIsVideoOn(!isVideoOn)}
                    className="rounded-full w-12 h-12"
                  >
                    {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                  </Button>

                  {userType === 'interviewer' && session.status === 'in_progress' && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleInterviewComplete}
                      className="rounded-full w-12 h-12"
                    >
                      <PhoneOff className="w-5 h-5" />
                    </Button>
                  )}
                </div>

                {/* Status overlay */}
                {session.status !== 'in_progress' && (
                  <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="text-lg font-semibold mb-2">
                        Interview {session.status.replace('_', ' ')}
                      </div>
                      {session.status === 'scheduled' && (
                        <div className="text-sm">
                          Starts at {session.scheduledAt.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Questions Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Interview Questions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {questions.length > 0 ? (
                <div className="space-y-3">
                  {questions.map((question, index) => (
                    <div
                      key={question.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        index === currentQuestionIndex
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                      onClick={() => setCurrentQuestionIndex(index)}
                    >
                      <div className="font-medium text-sm mb-1">
                        Question {index + 1}
                      </div>
                      <div className="text-sm text-gray-700 mb-2">
                        {question.question}
                      </div>
                      {question.candidateResponse && (
                        <div className="text-xs text-green-600 mt-2">
                          ✓ Response submitted
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500 text-center py-4">
                  No questions available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Current Question Details */}
          {questions[currentQuestionIndex] && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Question {currentQuestionIndex + 1}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm">
                  {questions[currentQuestionIndex].question}
                </div>

                {questions[currentQuestionIndex].expectedAnswer && (
                  <div className="text-xs text-gray-600">
                    <strong>Expected:</strong> {questions[currentQuestionIndex].expectedAnswer}
                  </div>
                )}

                {userType === 'candidate' && session.status === 'in_progress' && (
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Your response..."
                      value={candidateResponse}
                      onChange={(e) => setCandidateResponse(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <Button
                      onClick={submitQuestionResponse}
                      disabled={isSubmitting || !candidateResponse.trim()}
                      className="w-full"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Response'}
                    </Button>
                  </div>
                )}

                {questions[currentQuestionIndex].candidateResponse && (
                  <div className="text-sm bg-green-50 p-3 rounded border">
                    <strong>Your Response:</strong>
                    <div className="mt-1">{questions[currentQuestionIndex].candidateResponse}</div>
                  </div>
                )}

                {questions[currentQuestionIndex].aiAssessment && (
                  <div className="text-sm bg-blue-50 p-3 rounded border">
                    <strong>AI Assessment:</strong>
                    <div className="mt-1">{questions[currentQuestionIndex].aiAssessment}</div>
                    {questions[currentQuestionIndex].score && (
                      <div className="mt-2">
                        <strong>Score:</strong> {questions[currentQuestionIndex].score}/10
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Interviewer Notes */}
          {userType === 'interviewer' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Interview Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Add your notes about the candidate..."
                  value={interviewerNotes}
                  onChange={(e) => setInterviewerNotes(e.target.value)}
                  className="min-h-[120px]"
                />
                {session.status === 'in_progress' && (
                  <Button
                    onClick={handleInterviewComplete}
                    className="w-full mt-3"
                    disabled={!interviewerNotes.trim()}
                  >
                    Complete Interview
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Interview Progress */}
          {session.status === 'in_progress' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Questions Completed</span>
                    <span>{questions.filter(q => q.candidateResponse).length}/{questions.length}</span>
                  </div>
                  <Progress
                    value={(questions.filter(q => q.candidateResponse).length / questions.length) * 100}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
