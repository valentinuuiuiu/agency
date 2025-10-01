import { PrismaClient } from '@prisma/client'
import { NotificationWebSocketServer } from './websocket-server'

export interface InterviewSession {
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

export interface InterviewQuestion {
  id: string
  question: string
  expectedAnswer?: string
  aiAssessment?: string
  candidateResponse?: string
  score?: number
  timestamp?: Date
}

export interface InterviewAnalysis {
  overallScore: number
  communicationScore: number
  technicalSkillScore: number
  culturalFitScore: number
  motivationScore: number
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
  personalityTraits?: any
  sentimentAnalysis?: any
}

export class VideoInterviewService {
  private static instance: VideoInterviewService
  private prisma: PrismaClient
  private wsServer: NotificationWebSocketServer

  private constructor() {
    this.prisma = new PrismaClient()
    this.wsServer = NotificationWebSocketServer.getInstance()
  }

  public static getInstance(): VideoInterviewService {
    if (!VideoInterviewService.instance) {
      VideoInterviewService.instance = new VideoInterviewService()
    }
    return VideoInterviewService.instance
  }

  /**
   * Schedule a new video interview
   */
  async scheduleInterview(
    jobId: string,
    candidateId: string,
    interviewerId: string,
    scheduledAt: Date,
    duration: number = 60,
    templateId?: string
  ): Promise<InterviewSession> {
    try {
      // Check for conflicts
      const conflicts = await this.checkInterviewerAvailability(interviewerId, scheduledAt, duration)
      if (conflicts.length > 0) {
        throw new Error('Interviewer has scheduling conflicts')
      }

      // Create meeting room (would integrate with Zoom/Teams API)
      const meetingData = await this.createMeetingRoom(scheduledAt, duration)

      // Create interview record
      const interview = await this.prisma.videoInterview.create({
        data: {
          jobId,
          candidateId,
          interviewerId,
          scheduledAt,
          duration,
          meetingId: meetingData.meetingId,
          meetingUrl: meetingData.joinUrl,
          meetingPassword: meetingData.password,
          status: 'SCHEDULED'
        },
        include: {
          job: true,
          candidate: true,
          interviewer: true
        }
      })

      // Create interview questions if template provided
      if (templateId) {
        await this.createQuestionsFromTemplate(interview.id, templateId)
      }

      // Send notifications
      await this.notifyInterviewScheduled(candidateId, interview.id, scheduledAt)

      return this.formatInterviewSession(interview)
    } catch (error) {
      console.error('Schedule Interview Error:', error)
      throw error
    }
  }

  /**
   * Start an interview session
   */
  async startInterview(interviewId: string, interviewerId: string): Promise<void> {
    try {
      const interview = await this.prisma.videoInterview.findUnique({
        where: { id: interviewId },
        include: { candidate: true, interviewer: true }
      })

      if (!interview) {
        throw new Error('Interview not found')
      }

      if (interview.interviewerId !== interviewerId) {
        throw new Error('Unauthorized to start this interview')
      }

      // Update status
      await this.prisma.videoInterview.update({
        where: { id: interviewId },
        data: { status: 'IN_PROGRESS' }
      })

      // Notify candidate that interview has started
      this.wsServer.notifyInterviewScheduled(
        interview.candidateId,
        interview.jobId,
        interview.scheduledAt,
        'live'
      )

    } catch (error) {
      console.error('Start Interview Error:', error)
      throw error
    }
  }

  /**
   * Complete an interview session
   */
  async completeInterview(
    interviewId: string,
    interviewerNotes: string,
    recordingUrl?: string,
    recordingKey?: string
  ): Promise<InterviewAnalysis> {
    try {
      // Update interview record
      await this.prisma.videoInterview.update({
        where: { id: interviewId },
        data: {
          status: 'COMPLETED',
          interviewerNotes,
          recordingUrl,
          recordingKey
        }
      })

      // Generate AI analysis
      const analysis = await this.generateInterviewAnalysis(interviewId)

      // Store analysis
      await this.prisma.interviewAnalysis.create({
        data: {
          interviewId,
          overallScore: analysis.overallScore,
          communicationScore: analysis.communicationScore,
          technicalSkillScore: analysis.technicalSkillScore,
          culturalFitScore: analysis.culturalFitScore,
          motivationScore: analysis.motivationScore,
          strengths: analysis.strengths,
          weaknesses: analysis.weaknesses,
          recommendations: analysis.recommendations,
          personalityTraits: analysis.personalityTraits,
          sentimentAnalysis: analysis.sentimentAnalysis
        }
      })

      // Notify candidate about completion
      const interview = await this.prisma.videoInterview.findUnique({
        where: { id: interviewId },
        include: { candidate: true }
      })

      if (interview) {
        this.wsServer.notifyApplicationUpdate(
          interview.candidateId,
          interview.jobId,
          'INTERVIEWED',
          { interviewId, analysis: analysis.overallScore }
        )
      }

      return analysis
    } catch (error) {
      console.error('Complete Interview Error:', error)
      throw error
    }
  }

  /**
   * Get interview session details
   */
  async getInterviewSession(interviewId: string, userId: string): Promise<InterviewSession | null> {
    try {
      const interview = await this.prisma.videoInterview.findUnique({
        where: { id: interviewId },
        include: {
          job: true,
          candidate: true,
          interviewer: true,
          interviewQuestions: true,
          interviewAnalysis: true
        }
      })

      if (!interview) return null

      // Check permissions
      if (interview.candidateId !== userId && interview.interviewerId !== userId) {
        throw new Error('Unauthorized access to interview')
      }

      return this.formatInterviewSession(interview)
    } catch (error) {
      console.error('Get Interview Session Error:', error)
      throw error
    }
  }

  /**
   * Get interview questions for a session
   */
  async getInterviewQuestions(interviewId: string): Promise<InterviewQuestion[]> {
    try {
      const questions = await this.prisma.interviewQuestion.findMany({
        where: { interviewId },
        orderBy: { createdAt: 'asc' }
      })

      return questions.map(q => ({
        id: q.id,
        question: q.question,
        expectedAnswer: q.expectedAnswer || undefined,
        aiAssessment: q.aiAssessment || undefined,
        candidateResponse: q.candidateResponse || undefined,
        score: q.score || undefined,
        timestamp: q.timestamp || undefined
      }))
    } catch (error) {
      console.error('Get Interview Questions Error:', error)
      throw error
    }
  }

  /**
   * Submit candidate response to question
   */
  async submitQuestionResponse(
    interviewId: string,
    questionId: string,
    response: string,
    candidateId: string
  ): Promise<void> {
    try {
      const interview = await this.prisma.videoInterview.findUnique({
        where: { id: interviewId }
      })

      if (!interview || interview.candidateId !== candidateId) {
        throw new Error('Unauthorized or interview not found')
      }

      if (interview.status !== 'IN_PROGRESS') {
        throw new Error('Interview is not in progress')
      }

      // Update question with response
      await this.prisma.interviewQuestion.update({
        where: { id: questionId },
        data: {
          candidateResponse: response,
          timestamp: new Date()
        }
      })

      // Generate AI assessment for the response
      const aiAssessment = await this.assessQuestionResponse(response, questionId)

      if (aiAssessment) {
        await this.prisma.interviewQuestion.update({
          where: { id: questionId },
          data: {
            aiAssessment: aiAssessment.feedback,
            score: aiAssessment.score
          }
        })
      }

    } catch (error) {
      console.error('Submit Question Response Error:', error)
      throw error
    }
  }

  /**
   * Get interviewer availability
   */
  async getInterviewerAvailability(interviewerId: string, date: Date): Promise<any> {
    try {
      const availability = await this.prisma.interviewAvailability.findUnique({
        where: {
          interviewerId_date: {
            interviewerId,
            date: new Date(date.toDateString())
          }
        }
      })

      return availability
    } catch (error) {
      console.error('Get Interviewer Availability Error:', error)
      throw error
    }
  }

  /**
   * Set interviewer availability
   */
  async setInterviewerAvailability(
    interviewerId: string,
    date: Date,
    startTime: string,
    endTime: string,
    timeZone: string = 'Europe/Bucharest'
  ): Promise<void> {
    try {
      await this.prisma.interviewAvailability.upsert({
        where: {
          interviewerId_date: {
            interviewerId,
            date: new Date(date.toDateString())
          }
        },
        update: {
          startTime,
          endTime,
          timeZone,
          isAvailable: true
        },
        create: {
          interviewerId,
          date: new Date(date.toDateString()),
          startTime,
          endTime,
          timeZone,
          isAvailable: true
        }
      })
    } catch (error) {
      console.error('Set Interviewer Availability Error:', error)
      throw error
    }
  }

  /**
   * Create interview template
   */
  async createInterviewTemplate(
    name: string,
    category: string,
    questions: string[],
    duration: number,
    createdBy: string,
    description?: string,
    language: string = 'en'
  ): Promise<void> {
    try {
      await this.prisma.interviewTemplate.create({
        data: {
          name,
          description,
          category,
          language,
          questions,
          duration,
          createdBy
        }
      })
    } catch (error) {
      console.error('Create Interview Template Error:', error)
      throw error
    }
  }

  /**
   * Get interview templates by category
   */
  async getInterviewTemplates(category?: string): Promise<any[]> {
    try {
      const templates = await this.prisma.interviewTemplate.findMany({
        where: category ? { category } : undefined,
        include: { createdByUser: { select: { name: true, email: true } } }
      })

      return templates
    } catch (error) {
      console.error('Get Interview Templates Error:', error)
      throw error
    }
  }

  // Private helper methods

  private async checkInterviewerAvailability(
    interviewerId: string,
    scheduledAt: Date,
    duration: number
  ): Promise<any[]> {
    // Check for overlapping interviews
    const conflicts = await this.prisma.videoInterview.findMany({
      where: {
        interviewerId,
        status: { in: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'] },
        scheduledAt: {
          gte: scheduledAt,
          lt: new Date(scheduledAt.getTime() + duration * 60000)
        }
      }
    })

    return conflicts
  }

  private async createMeetingRoom(scheduledAt: Date, duration: number): Promise<any> {
    // This would integrate with Zoom, Teams, or WebRTC APIs
    // For now, return mock data
    return {
      meetingId: `room_${Date.now()}`,
      joinUrl: `https://meet.example.com/room_${Date.now()}`,
      password: Math.random().toString(36).substring(2, 8)
    }
  }

  private async createQuestionsFromTemplate(interviewId: string, templateId: string): Promise<void> {
    const template = await this.prisma.interviewTemplate.findUnique({
      where: { id: templateId }
    })

    if (template) {
      for (const question of template.questions) {
        await this.prisma.interviewQuestion.create({
          data: {
            interviewId,
            question
          }
        })
      }
    }
  }

  private async notifyInterviewScheduled(
    candidateId: string,
    interviewId: string,
    scheduledAt: Date
  ): Promise<void> {
    this.wsServer.notifyInterviewScheduled(
      candidateId,
      interviewId,
      scheduledAt,
      'scheduled'
    )
  }

  private async generateInterviewAnalysis(interviewId: string): Promise<InterviewAnalysis> {
    // This would use AI to analyze the interview recording/transcript
    // For now, return mock analysis
    return {
      overallScore: Math.floor(Math.random() * 40) + 60, // 60-100
      communicationScore: Math.floor(Math.random() * 30) + 70, // 70-100
      technicalSkillScore: Math.floor(Math.random() * 40) + 60, // 60-100
      culturalFitScore: Math.floor(Math.random() * 30) + 70, // 70-100
      motivationScore: Math.floor(Math.random() * 30) + 70, // 70-100
      strengths: ['Good communication', 'Technical knowledge', 'Cultural fit'],
      weaknesses: ['Limited experience', 'Language barrier'],
      recommendations: ['Consider for position', 'Provide training'],
      personalityTraits: { extraversion: 0.7, conscientiousness: 0.8 },
      sentimentAnalysis: { positive: 0.6, neutral: 0.3, negative: 0.1 }
    }
  }

  private async assessQuestionResponse(response: string, questionId: string): Promise<any> {
    // This would use AI to assess the candidate's response
    // For now, return mock assessment
    return {
      score: Math.floor(Math.random() * 3) + 7, // 7-10
      feedback: 'Good response with relevant details and clear communication.'
    }
  }

  private formatInterviewSession(interview: any): InterviewSession {
    return {
      id: interview.id,
      meetingId: interview.meetingId,
      meetingUrl: interview.meetingUrl,
      scheduledAt: interview.scheduledAt,
      duration: interview.duration,
      status: interview.status.toLowerCase(),
      recordingUrl: interview.recordingUrl,
      aiTranscription: interview.aiTranscription,
      aiNotes: interview.aiNotes,
      aiScore: interview.aiScore,
      interviewerNotes: interview.interviewerNotes,
      candidateFeedback: interview.candidateFeedback
    }
  }
}
