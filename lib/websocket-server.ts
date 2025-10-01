import WebSocket from 'ws'
import { IncomingMessage } from 'http'

interface NotificationMessage {
  id: string
  type: 'application_update' | 'new_job_match' | 'interview_scheduled' | 'placement_confirmed' | 'message_received'
  title: string
  message: string
  data?: any
  timestamp: Date
  priority: 'low' | 'medium' | 'high' | 'urgent'
}

interface WebSocketClient {
  ws: WebSocket
  userId: string
  userType: 'candidate' | 'recruiter' | 'agency'
  lastPing: number
}

export class NotificationWebSocketServer {
  private static instance: NotificationWebSocketServer
  private wss: WebSocket.Server | null = null
  private clients: Map<string, WebSocketClient> = new Map()
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null

  private constructor() {}

  public static getInstance(): NotificationWebSocketServer {
    if (!NotificationWebSocketServer.instance) {
      NotificationWebSocketServer.instance = new NotificationWebSocketServer()
    }
    return NotificationWebSocketServer.instance
  }

  /**
   * Initialize WebSocket server
   */
  initialize(server: any) {
    this.wss = new WebSocket.Server({ server })

    this.wss.on('connection', (ws: WebSocket, request: IncomingMessage) => {
      this.handleConnection(ws, request)
    })

    // Start heartbeat to detect dead connections
    this.startHeartbeat()

    console.log('WebSocket notification server initialized')
  }

  /**
   * Handle new WebSocket connection
   */
  private handleConnection(ws: WebSocket, request: IncomingMessage) {
    const url = new URL(request.url || '', 'http://localhost')
    const userId = url.searchParams.get('userId')
    const userType = url.searchParams.get('userType') as 'candidate' | 'recruiter' | 'agency'

    if (!userId || !userType) {
      ws.close(1003, 'Missing userId or userType')
      return
    }

    const clientId = `${userType}_${userId}`
    const client: WebSocketClient = {
      ws,
      userId,
      userType,
      lastPing: Date.now()
    }

    this.clients.set(clientId, client)

    // Handle incoming messages
    ws.on('message', (message: Buffer) => {
      this.handleMessage(clientId, message)
    })

    ws.on('close', () => {
      this.clients.delete(clientId)
      console.log(`WebSocket client disconnected: ${clientId}`)
    })

    ws.on('error', (error) => {
      console.error(`WebSocket error for ${clientId}:`, error)
      this.clients.delete(clientId)
    })

    // Send welcome message
    this.sendToClient(clientId, {
      type: 'connection_established',
      message: 'Connected to notification server',
      timestamp: new Date()
    })

    console.log(`WebSocket client connected: ${clientId}`)
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(clientId: string, message: Buffer) {
    try {
      const data = JSON.parse(message.toString())

      switch (data.type) {
        case 'ping':
          this.handlePing(clientId)
          break
        case 'subscribe':
          this.handleSubscription(clientId, data.channels)
          break
        case 'unsubscribe':
          this.handleUnsubscription(clientId, data.channels)
          break
        default:
          console.log(`Unknown message type: ${data.type}`)
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error)
    }
  }

  /**
   * Handle ping/pong for connection health
   */
  private handlePing(clientId: string) {
    const client = this.clients.get(clientId)
    if (client) {
      client.lastPing = Date.now()
      client.ws.send(JSON.stringify({ type: 'pong', timestamp: new Date() }))
    }
  }

  /**
   * Handle subscription requests (if needed for advanced features)
   */
  private handleSubscription(clientId: string, channels: string[]) {
    // Store subscription preferences if needed
    console.log(`Client ${clientId} subscribed to: ${channels.join(', ')}`)
  }

  /**
   * Handle unsubscription requests
   */
  private handleUnsubscription(clientId: string, channels: string[]) {
    // Remove subscriptions if needed
    console.log(`Client ${clientId} unsubscribed from: ${channels.join(', ')}`)
  }

  /**
   * Send notification to specific client
   */
  sendToClient(clientId: string, message: any) {
    const client = this.clients.get(clientId)
    if (client && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message))
    }
  }

  /**
   * Send notification to user by ID and type
   */
  sendToUser(userId: string, userType: 'candidate' | 'recruiter' | 'agency', notification: NotificationMessage) {
    const clientId = `${userType}_${userId}`
    this.sendToClient(clientId, notification)
  }

  /**
   * Broadcast notification to all clients of a specific user type
   */
  broadcastToUserType(userType: 'candidate' | 'recruiter' | 'agency', notification: NotificationMessage) {
    for (const [clientId, client] of this.clients) {
      if (client.userType === userType) {
        this.sendToClient(clientId, notification)
      }
    }
  }

  /**
   * Broadcast to all connected clients
   */
  broadcast(notification: NotificationMessage) {
    for (const [clientId] of this.clients) {
      this.sendToClient(clientId, notification)
    }
  }

  /**
   * Send application status update notification
   */
  notifyApplicationUpdate(candidateId: string, jobId: string, status: string, additionalData?: any) {
    const notification: NotificationMessage = {
      id: `app_${Date.now()}`,
      type: 'application_update',
      title: 'Application Status Updated',
      message: `Your application status has been updated to: ${status}`,
      data: { jobId, status, ...additionalData },
      timestamp: new Date(),
      priority: status === 'ACCEPTED' ? 'high' : 'medium'
    }

    this.sendToUser(candidateId, 'candidate', notification)
  }

  /**
   * Notify candidate about new job match
   */
  notifyJobMatch(candidateId: string, jobId: string, matchScore: number) {
    const notification: NotificationMessage = {
      id: `match_${Date.now()}`,
      type: 'new_job_match',
      title: 'New Job Match Found!',
      message: `We've found a ${matchScore}% match for you!`,
      data: { jobId, matchScore },
      timestamp: new Date(),
      priority: matchScore >= 80 ? 'high' : 'medium'
    }

    this.sendToUser(candidateId, 'candidate', notification)
  }

  /**
   * Notify candidate about interview scheduling
   */
  notifyInterviewScheduled(candidateId: string, jobId: string, interviewDate: Date, interviewType: string) {
    const notification: NotificationMessage = {
      id: `interview_${Date.now()}`,
      type: 'interview_scheduled',
      title: 'Interview Scheduled',
      message: `Your ${interviewType} interview is scheduled for ${interviewDate.toLocaleString()}`,
      data: { jobId, interviewDate, interviewType },
      timestamp: new Date(),
      priority: 'high'
    }

    this.sendToUser(candidateId, 'candidate', notification)
  }

  /**
   * Notify all recruiters about new application
   */
  notifyNewApplication(jobId: string, candidateId: string, applicationId: string) {
    const notification: NotificationMessage = {
      id: `new_app_${Date.now()}`,
      type: 'application_update',
      title: 'New Application Received',
      message: 'A new candidate has applied to your job posting',
      data: { jobId, candidateId, applicationId },
      timestamp: new Date(),
      priority: 'medium'
    }

    this.broadcastToUserType('recruiter', notification)
  }

  /**
   * Notify about placement confirmation
   */
  notifyPlacementConfirmed(candidateId: string, jobId: string, placementData: any) {
    const candidateNotification: NotificationMessage = {
      id: `placement_${Date.now()}`,
      type: 'placement_confirmed',
      title: '🎉 Congratulations! Placement Confirmed',
      message: 'Your placement has been confirmed. Welcome to your new role!',
      data: { jobId, ...placementData },
      timestamp: new Date(),
      priority: 'urgent'
    }

    this.sendToUser(candidateId, 'candidate', candidateNotification)
  }

  /**
   * Notify about new chat messages
   */
  notifyMessageReceived(recipientId: string, senderId: string, messagePreview: string) {
    const notification: NotificationMessage = {
      id: `message_${Date.now()}`,
      type: 'message_received',
      title: 'New Message',
      message: `Message from ${senderId}: ${messagePreview}`,
      data: { senderId },
      timestamp: new Date(),
      priority: 'low'
    }

    // Determine recipient type (this would need proper user type resolution)
    const userTypes: ('candidate' | 'recruiter' | 'agency')[] = ['candidate', 'recruiter', 'agency']
    for (const userType of userTypes) {
      try {
        this.sendToUser(recipientId, userType, notification)
        break // Stop after first successful send
      } catch (error) {
        continue
      }
    }
  }

  /**
   * Start heartbeat to clean up dead connections
   */
  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      const now = Date.now()
      const timeout = 60000 // 1 minute timeout

      for (const [clientId, client] of this.clients) {
        if (now - client.lastPing > timeout) {
          console.log(`Removing dead client: ${clientId}`)
          client.ws.terminate()
          this.clients.delete(clientId)
        }
      }
    }, 30000) // Check every 30 seconds
  }

  /**
   * Stop the WebSocket server and cleanup
   */
  shutdown() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }

    if (this.wss) {
      this.wss.close(() => {
        console.log('WebSocket notification server shut down')
      })
      this.wss = null
    }

    // Close all client connections
    for (const [clientId, client] of this.clients) {
      client.ws.close()
    }
    this.clients.clear()
  }

  /**
   * Get current connection statistics
   */
  getStats() {
    const stats = {
      totalConnections: this.clients.size,
      candidates: 0,
      recruiters: 0,
      agencies: 0
    }

    for (const [clientId, client] of this.clients) {
      switch (client.userType) {
        case 'candidate':
          stats.candidates++
          break
        case 'recruiter':
          stats.recruiters++
          break
        case 'agency':
          stats.agencies++
          break
      }
    }

    return stats
  }
}
