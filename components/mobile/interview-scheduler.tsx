'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CalendarIcon, Clock, Users, Video, CheckCircle, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { ro } from 'date-fns/locale'

interface InterviewTemplate {
  id: string
  name: string
  description?: string
  category: string
  duration: number
  questions: string[]
}

interface InterviewSchedulerProps {
  jobId: string
  candidateId: string
  onScheduled?: (interviewId: string) => void
}

export function InterviewScheduler({ jobId, candidateId, onScheduled }: InterviewSchedulerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [templates, setTemplates] = useState<InterviewTemplate[]>([])
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string>('')

  // Load interview templates
  useEffect(() => {
    loadTemplates()
  }, [])

  // Load available time slots when date changes
  useEffect(() => {
    if (selectedDate) {
      loadAvailableSlots(selectedDate)
    }
  }, [selectedDate])

  const loadTemplates = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/interviews?action=get_templates&userId=candidate')
      const data = await response.json()

      if (data.success) {
        setTemplates(data.templates)
      }
    } catch (error) {
      console.error('Failed to load templates:', error)
      setError('Failed to load interview templates')
    } finally {
      setIsLoading(false)
    }
  }

  const loadAvailableSlots = async (date: Date) => {
    try {
      // This would call an API to get available interviewer slots
      // For now, generate mock slots
      const slots = []
      for (let hour = 9; hour <= 17; hour++) {
        slots.push(`${hour.toString().padStart(2, '0')}:00`)
        slots.push(`${hour.toString().padStart(2, '0')}:30`)
      }
      setAvailableSlots(slots)
    } catch (error) {
      console.error('Failed to load available slots:', error)
    }
  }

  const handleScheduleInterview = async () => {
    if (!selectedDate || !selectedTime || !selectedTemplate) {
      setError('Please select date, time, and interview template')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const scheduledAt = new Date(selectedDate)
      const [hours, minutes] = selectedTime.split(':')
      scheduledAt.setHours(parseInt(hours), parseInt(minutes))

      const response = await fetch('/api/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'schedule',
          jobId,
          candidateId,
          interviewerId: 'interviewer_001', // This would come from actual interviewer selection
          scheduledAt: scheduledAt.toISOString(),
          duration: templates.find(t => t.id === selectedTemplate)?.duration || 60,
          templateId: selectedTemplate
        })
      })

      const data = await response.json()

      if (data.success) {
        if (onScheduled) {
          onScheduled(data.interview.id)
        }
      } else {
        setError(data.error || 'Failed to schedule interview')
      }
    } catch (error) {
      console.error('Failed to schedule interview:', error)
      setError('Failed to schedule interview')
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedTemplateData = templates.find(t => t.id === selectedTemplate)

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="w-5 h-5" />
            Schedule Video Interview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Choose your preferred date and time for the video interview. We'll match you with an available interviewer.
          </p>
        </CardContent>
      </Card>

      {/* Date Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarIcon className="w-4 h-4" />
            Select Date
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={(date) => date < new Date() || date.getDay() === 0} // Disable past dates and Sundays
            className="rounded-md border w-full"
          />
        </CardContent>
      </Card>

      {/* Time Selection */}
      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="w-4 h-4" />
              Select Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              {availableSlots.map((slot) => (
                <Button
                  key={slot}
                  variant={selectedTime === slot ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTime(slot)}
                  className="text-sm"
                >
                  {slot}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Template Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="w-4 h-4" />
            Interview Type
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
            <SelectTrigger>
              <SelectValue placeholder="Select interview template" />
            </SelectTrigger>
            <SelectContent>
              {templates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{template.name}</span>
                    <span className="text-xs text-gray-500">
                      {template.duration} min • {template.questions.length} questions
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedTemplateData && (
            <div className="p-3 bg-blue-50 rounded-lg border">
              <h4 className="font-medium text-sm mb-2">{selectedTemplateData.name}</h4>
              {selectedTemplateData.description && (
                <p className="text-xs text-gray-600 mb-2">{selectedTemplateData.description}</p>
              )}
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>Duration: {selectedTemplateData.duration} minutes</span>
                <span>Questions: {selectedTemplateData.questions.length}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Interview Preview */}
      {selectedDate && selectedTime && selectedTemplateData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Interview Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Date & Time:</span>
              <span className="text-sm">
                {format(selectedDate, 'PPP', { locale: ro })} at {selectedTime}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Duration:</span>
              <span className="text-sm">{selectedTemplateData.duration} minutes</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Type:</span>
              <Badge variant="secondary">{selectedTemplateData.category}</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Schedule Button */}
      <Button
        onClick={handleScheduleInterview}
        disabled={!selectedDate || !selectedTime || !selectedTemplate || isSubmitting}
        className="w-full"
        size="lg"
      >
        {isSubmitting ? 'Scheduling...' : 'Schedule Interview'}
      </Button>

      {/* Mobile Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <h4 className="font-medium text-sm mb-2">Tips for Mobile Interview:</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Find a quiet, well-lit location</li>
            <li>• Ensure stable internet connection</li>
            <li>• Test your camera and microphone beforehand</li>
            <li>• Have your resume and documents ready</li>
            <li>• Join 5 minutes early to test connection</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
