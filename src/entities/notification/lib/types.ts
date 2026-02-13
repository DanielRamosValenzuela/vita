export const NOTIFICATION_TYPES = {
  INVITATION_PENDING: 'INVITATION_PENDING',
} as const

export type NotificationType = (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES]

export interface PendingNotification {
  id: string
  type: NotificationType
  createdAt: Date
  meta?: Record<string, unknown>
}
