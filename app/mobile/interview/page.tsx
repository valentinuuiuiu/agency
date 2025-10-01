'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { InterviewScheduler } from '@/components/mobile/interview-scheduler'
import { VideoInterviewRoom } from '@/components/video-interview/video-interview-room'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Smartphone, Wifi, WifiOff } from 'lucide-react'

export default function MobileInterviewPage() {
  const searchParams = useSearchParams()
  const interviewId = searchParams.get('interviewId')
  const jobId = searchParams.get('jobId')
  const candidateId = searchParams.get('candidateId')
  const action = searchParams.get('action') // 'schedule' or 'join'

  const [isOnline, setIsOnline] = useState(true)
  const [scheduledInterviewId, setScheduledInterviewId] = useState<string | null>(null)

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // If joining an existing interview
  if (interviewId && candidateId && action === 'join') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Header */}
        <div className="bg-white border-b p-4 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm font-medium">
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>

        {/* Connection Warning */}
        {!isOnline && (
          <Card className="m-4 border-orange-200 bg-orange-50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-orange-600">
                <WifiOff className="w-4 h-4" />
                <span className="text-sm">
                  You're offline. Please connect to the internet for the best interview experience.
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Video Interview Room */}
        <VideoInterviewRoom
          interviewId={interviewId}
          userId={candidateId}
          userType="candidate"
        />
      </div>
    )
  }

  // If scheduling a new interview
  if (jobId && candidateId) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Header */}
        <div className="bg-white border-b p-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4" />
            <span className="text-sm font-medium">Schedule Interview</span>
          </div>
          <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
        </div>

        {/* Connection Status */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            {isOnline ? (
              <>
                <Wifi className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-600">Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-600">Offline Mode</span>
              </>
            )}
          </div>

          {/* Interview Scheduler */}
          <InterviewScheduler
            jobId={jobId}
            candidateId={candidateId}
            onScheduled={(newInterviewId) => {
              setScheduledInterviewId(newInterviewId)
            }}
          />

          {/* Success Message */}
          {scheduledInterviewId && (
            <Card className="mt-6 bg-green-50 border-green-200">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-green-600">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Interview Scheduled
                  </Badge>
                </div>
                <p className="text-sm text-green-700 mt-2">
                  Your interview has been scheduled successfully. You'll receive a notification with the meeting link when it's time.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    )
  }

  // Default state - no parameters
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-center">Mobile Interview</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            To schedule or join an interview, please use the proper link provided in your email or notification.
          </p>
          <Button onClick={() => window.history.back()} className="w-full">
            Go Back
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
