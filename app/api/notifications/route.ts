import { NextRequest, NextResponse } from 'next/server'
import { NotificationWebSocketServer } from '@/lib/websocket-server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, userId, userType, ...notificationData } = body

    if (!type || !userId || !userType) {
      return NextResponse.json(
        { error: 'Missing required fields: type, userId, userType' },
        { status: 400 }
      )
    }

    const wsServer = NotificationWebSocketServer.getInstance()

    switch (type) {
      case 'application_update':
        wsServer.notifyApplicationUpdate(
          userId,
          notificationData.jobId,
          notificationData.status,
          notificationData
        )
        break

      case 'job_match':
        wsServer.notifyJobMatch(
          userId,
          notificationData.jobId,
          notificationData.matchScore
        )
        break

      case 'interview_scheduled':
        wsServer.notifyInterviewScheduled(
          userId,
          notificationData.jobId,
          new Date(notificationData.interviewDate),
          notificationData.interviewType
        )
        break

      case 'placement_confirmed':
        wsServer.notifyPlacementConfirmed(
          userId,
          notificationData.jobId,
          notificationData
        )
        break

      case 'message_received':
        wsServer.notifyMessageReceived(
          userId,
          notificationData.senderId,
          notificationData.messagePreview
        )
        break

      default:
        return NextResponse.json(
          { error: `Unknown notification type: ${type}` },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      message: `Notification sent successfully`
    })

  } catch (error) {
    console.error('Notification API Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to send notification',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const wsServer = NotificationWebSocketServer.getInstance()
    const stats = wsServer.getStats()

    return NextResponse.json({
      success: true,
      stats
    })

  } catch (error) {
    console.error('Notification Stats API Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to get notification stats',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
