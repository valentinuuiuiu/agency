import { NextRequest, NextResponse } from 'next/server'
import { VideoInterviewService } from '@/lib/video-interview-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      action,
      jobId,
      candidateId,
      interviewerId,
      scheduledAt,
      duration,
      templateId,
      interviewId,
      interviewerNotes,
      recordingUrl,
      recordingKey,
      questionId,
      response,
      name,
      category,
      questions,
      createdBy,
      description,
      language,
      date,
      startTime,
      endTime,
      timeZone
    } = body

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      )
    }

    const interviewService = VideoInterviewService.getInstance()

    switch (action) {
      case 'schedule': {
        if (!jobId || !candidateId || !interviewerId || !scheduledAt) {
          return NextResponse.json(
            { error: 'Missing required fields for scheduling' },
            { status: 400 }
          )
        }

        const interview = await interviewService.scheduleInterview(
          jobId,
          candidateId,
          interviewerId,
          new Date(scheduledAt),
          duration,
          templateId
        )

        return NextResponse.json({
          success: true,
          interview
        })
      }

      case 'start':
        if (!interviewId || !interviewerId) {
          return NextResponse.json(
            { error: 'Interview ID and interviewer ID are required' },
            { status: 400 }
          )
        }

        await interviewService.startInterview(interviewId, interviewerId)

        return NextResponse.json({
          success: true,
          message: 'Interview started successfully'
        })

      case 'complete': {
        if (!interviewId || !interviewerNotes) {
          return NextResponse.json(
            { error: 'Interview ID and interviewer notes are required' },
            { status: 400 }
          )
        }

        const analysis = await interviewService.completeInterview(
          interviewId,
          interviewerNotes,
          recordingUrl,
          recordingKey
        )

        return NextResponse.json({
          success: true,
          analysis
        })
      }

      case 'submit_response':
        if (!interviewId || !questionId || !response || !candidateId) {
          return NextResponse.json(
            { error: 'Interview ID, question ID, response, and candidate ID are required' },
            { status: 400 }
          )
        }

        await interviewService.submitQuestionResponse(
          interviewId,
          questionId,
          response,
          candidateId
        )

        return NextResponse.json({
          success: true,
          message: 'Response submitted successfully'
        })

      case 'set_availability':
        if (!interviewerId || !date || !startTime || !endTime) {
          return NextResponse.json(
            { error: 'Interviewer ID, date, start time, and end time are required' },
            { status: 400 }
          )
        }

        await interviewService.setInterviewerAvailability(
          interviewerId,
          new Date(date),
          startTime,
          endTime,
          timeZone
        )

        return NextResponse.json({
          success: true,
          message: 'Availability set successfully'
        })

      case 'create_template':
        if (!name || !category || !questions || !createdBy) {
          return NextResponse.json(
            { error: 'Name, category, questions, and created by are required' },
            { status: 400 }
          )
        }

        await interviewService.createInterviewTemplate(
          name,
          category,
          questions,
          duration || 60,
          createdBy,
          description,
          language || 'en'
        )

        return NextResponse.json({
          success: true,
          message: 'Template created successfully'
        })

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Interview API Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to process interview request',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const interviewId = searchParams.get('interviewId')
    const userId = searchParams.get('userId')
    const category = searchParams.get('category')
    const interviewerId = searchParams.get('interviewerId')
    const date = searchParams.get('date')

    if (!action || !userId) {
      return NextResponse.json(
        { error: 'Action and user ID are required' },
        { status: 400 }
      )
    }

    const interviewService = VideoInterviewService.getInstance()

    switch (action) {
      case 'get_session': {
        if (!interviewId) {
          return NextResponse.json(
            { error: 'Interview ID is required' },
            { status: 400 }
          )
        }

        const session = await interviewService.getInterviewSession(interviewId, userId)

        if (!session) {
          return NextResponse.json(
            { error: 'Interview not found or access denied' },
            { status: 404 }
          )
        }

        return NextResponse.json({
          success: true,
          session
        })
      }

      case 'get_questions': {
        if (!interviewId) {
          return NextResponse.json(
            { error: 'Interview ID is required' },
            { status: 400 }
          )
        }

        const questions = await interviewService.getInterviewQuestions(interviewId)

        return NextResponse.json({
          success: true,
          questions
        })
      }

      case 'get_templates': {
        const templates = await interviewService.getInterviewTemplates(category || undefined)

        return NextResponse.json({
          success: true,
          templates
        })
      }

      case 'get_availability': {
        if (!interviewerId || !date) {
          return NextResponse.json(
            { error: 'Interviewer ID and date are required' },
            { status: 400 }
          )
        }

        const availability = await interviewService.getInterviewerAvailability(
          interviewerId,
          new Date(date)
        )

        return NextResponse.json({
          success: true,
          availability
        })
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Interview API GET Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to get interview data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
