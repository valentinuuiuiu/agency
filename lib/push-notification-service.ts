import { PrismaClient } from '@prisma/client'

export interface PushNotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  data?: any
  actions?: Array<{
    action: string
    title: string
    icon?: string
  }>
  requireInteraction?: boolean
  silent?: boolean
}

export class PushNotificationService {
  private static instance: PushNotificationService
  private prisma: PrismaClient

  private constructor() {
    this.prisma = new PrismaClient()
  }

  public static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService()
    }
    return PushNotificationService.instance
  }

  /**
   * Register push token for user
   */
  async registerPushToken(
    userId: string,
    token: string,
    platform: 'ios' | 'android' | 'web',
    deviceId?: string
  ): Promise<void> {
    try {
      await this.prisma.pushToken.upsert({
        where: {
          userId_token: {
            userId,
            token
          }
        },
        update: {
          platform,
          deviceId,
          updatedAt: new Date()
        },
        create: {
          userId,
          token,
          platform,
          deviceId
        }
      })
    } catch (error) {
      console.error('Failed to register push token:', error)
      throw error
    }
  }

  /**
   * Send push notification to user
   */
  async sendToUser(
    userId: string,
    payload: PushNotificationPayload
  ): Promise<void> {
    try {
      // Get user's push tokens
      const pushTokens = await this.prisma.pushToken.findMany({
        where: { userId }
      })

      if (pushTokens.length === 0) {
        console.log(`No push tokens found for user ${userId}`)
        return
      }

      // Send to each token based on platform
      for (const token of pushTokens) {
        await this.sendToToken(token, payload)
      }

      // Store notification in database
      await this.storeNotification(userId, payload)

    } catch (error) {
      console.error('Failed to send push notification:', error)
      throw error
    }
  }

  /**
   * Send push notification to multiple users
   */
  async sendToUsers(
    userIds: string[],
    payload: PushNotificationPayload
  ): Promise<void> {
    try {
      const promises = userIds.map(userId => this.sendToUser(userId, payload))
      await Promise.all(promises)
    } catch (error) {
      console.error('Failed to send bulk push notifications:', error)
      throw error
    }
  }

  /**
   * Send application status update notification
   */
  async notifyApplicationUpdate(
    candidateId: string,
    jobId: string,
    status: string,
    additionalData?: any
  ): Promise<void> {
    const payload: PushNotificationPayload = {
      title: 'Application Status Updated',
      body: `Your application status has been updated to: ${status}`,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      tag: 'application_update',
      data: {
        type: 'application_update',
        jobId,
        status,
        ...additionalData,
        url: `/applications/${jobId}`
      },
      actions: [
        {
          action: 'view',
          title: 'View Application'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ],
      requireInteraction: status === 'ACCEPTED'
    }

    await this.sendToUser(candidateId, payload)
  }

  /**
   * Send new job match notification
   */
  async notifyJobMatch(
    candidateId: string,
    jobId: string,
    matchScore: number
  ): Promise<void> {
    const payload: PushNotificationPayload = {
      title: '🎯 New Job Match Found!',
      body: `We found a ${matchScore}% match for you! Check it out.`,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      tag: 'job_match',
      data: {
        type: 'job_match',
        jobId,
        matchScore,
        url: `/jobs/${jobId}`
      },
      actions: [
        {
          action: 'view',
          title: 'View Job'
        },
        {
          action: 'apply',
          title: 'Apply Now'
        }
      ],
      requireInteraction: true
    }

    await this.sendToUser(candidateId, payload)
  }

  /**
   * Send interview reminder notification
   */
  async notifyInterviewReminder(
    candidateId: string,
    interviewId: string,
    scheduledAt: Date,
    minutesUntil: number
  ): Promise<void> {
    const payload: PushNotificationPayload = {
      title: 'Interview Reminder',
      body: `Your interview starts in ${minutesUntil} minutes`,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      tag: 'interview_reminder',
      data: {
        type: 'interview_reminder',
        interviewId,
        scheduledAt,
        url: `/interviews/${interviewId}`
      },
      actions: [
        {
          action: 'join',
          title: 'Join Interview'
        },
        {
          action: 'reschedule',
          title: 'Reschedule'
        }
      ],
      requireInteraction: true
    }

    await this.sendToUser(candidateId, payload)
  }

  /**
   * Send placement confirmation notification
   */
  async notifyPlacementConfirmed(
    candidateId: string,
    jobId: string,
    placementData: any
  ): Promise<void> {
    const payload: PushNotificationPayload = {
      title: '🎉 Congratulations! Placement Confirmed',
      body: 'Your placement has been confirmed. Welcome to your new role!',
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      tag: 'placement_confirmed',
      data: {
        type: 'placement_confirmed',
        jobId,
        ...placementData,
        url: `/placements/${placementData.placementId}`
      },
      actions: [
        {
          action: 'view',
          title: 'View Details'
        },
        {
          action: 'contact',
          title: 'Contact Support'
        }
      ],
      requireInteraction: true
    }

    await this.sendToUser(candidateId, payload)
  }

  /**
   * Send message notification
   */
  async notifyMessageReceived(
    recipientId: string,
    senderId: string,
    messagePreview: string
  ): Promise<void> {
    const payload: PushNotificationPayload = {
      title: 'New Message',
      body: `Message: ${messagePreview}`,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      tag: 'message_received',
      data: {
        type: 'message_received',
        senderId,
        url: `/messages/${senderId}`
      },
      actions: [
        {
          action: 'reply',
          title: 'Reply'
        },
        {
          action: 'view',
          title: 'View Messages'
        }
      ]
    }

    await this.sendToUser(recipientId, payload)
  }

  /**
   * Send system maintenance notification
   */
  async notifySystemMaintenance(
    userIds: string[],
    maintenanceTime: Date,
    duration: number
  ): Promise<void> {
    const payload: PushNotificationPayload = {
      title: 'Scheduled Maintenance',
      body: `System maintenance scheduled for ${maintenanceTime.toLocaleString()} (${duration} minutes)`,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      tag: 'system_maintenance',
      data: {
        type: 'system_maintenance',
        maintenanceTime,
        duration,
        url: '/maintenance'
      },
      requireInteraction: false,
      silent: true
    }

    await this.sendToUsers(userIds, payload)
  }

  /**
   * Remove push token (device uninstalled/unregistered)
   */
  async removePushToken(userId: string, token: string): Promise<void> {
    try {
      await this.prisma.pushToken.deleteMany({
        where: {
          userId,
          token
        }
      })
    } catch (error) {
      console.error('Failed to remove push token:', error)
      throw error
    }
  }

  /**
   * Get user's push tokens
   */
  async getUserPushTokens(userId: string): Promise<any[]> {
    try {
      return await this.prisma.pushToken.findMany({
        where: { userId }
      })
    } catch (error) {
      console.error('Failed to get user push tokens:', error)
      throw error
    }
  }

  /**
   * Clean up expired push tokens
   */
  async cleanupExpiredTokens(): Promise<number> {
    try {
      // Remove tokens older than 90 days
      const ninetyDaysAgo = new Date()
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

      const result = await this.prisma.pushToken.deleteMany({
        where: {
          updatedAt: {
            lt: ninetyDaysAgo
          }
        }
      })

      return result.count
    } catch (error) {
      console.error('Failed to cleanup expired tokens:', error)
      throw error
    }
  }

  // Private helper methods

  private async sendToToken(token: any, payload: PushNotificationPayload): Promise<void> {
    // This would integrate with actual push notification services
    // like Firebase Cloud Messaging (FCM), Apple Push Notification Service (APNs), etc.

    switch (token.platform) {
      case 'ios':
        await this.sendAPNsNotification(token.token, payload)
        break
      case 'android':
      case 'web':
        await this.sendFCMNotification(token.token, payload)
        break
      default:
        console.warn(`Unsupported platform: ${token.platform}`)
    }
  }

  private async sendAPNsNotification(deviceToken: string, payload: PushNotificationPayload): Promise<void> {
    // Integration with Apple Push Notification Service
    // This would use APNs certificates/keys
    console.log('Sending APNs notification to:', deviceToken)
    // Implementation would use 'node-apn' or similar library
  }

  private async sendFCMNotification(token: string, payload: PushNotificationPayload): Promise<void> {
    // Integration with Firebase Cloud Messaging
    // This would use FCM server key
    console.log('Sending FCM notification to:', token)
    // Implementation would use 'firebase-admin' or similar library
  }

  private async storeNotification(userId: string, payload: PushNotificationPayload): Promise<void> {
    try {
      await this.prisma.notification.create({
        data: {
          type: this.mapPayloadToNotificationType(payload),
          title: payload.title,
          message: payload.body,
          priority: this.mapPayloadToPriority(payload),
          recipientId: userId,
          data: payload.data
        }
      })
    } catch (error) {
      console.error('Failed to store notification:', error)
      // Don't throw - storing notification is not critical
    }
  }

  private mapPayloadToNotificationType(payload: PushNotificationPayload): string {
    if (payload.data?.type) {
      return payload.data.type.toUpperCase()
    }
    return 'SYSTEM_MAINTENANCE'
  }

  private mapPayloadToPriority(payload: PushNotificationPayload): string {
    if (payload.requireInteraction) {
      return 'URGENT'
    }
    if (payload.data?.type === 'job_match' || payload.data?.type === 'placement_confirmed') {
      return 'HIGH'
    }
    return 'MEDIUM'
  }
}
