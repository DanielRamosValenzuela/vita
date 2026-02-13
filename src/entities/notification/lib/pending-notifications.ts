import { NOTIFICATIONS_LIMITS } from '@/src/shared/lib/constants'

import { getPendingInvitationsForUser } from '@/src/entities/invitation'

import { NOTIFICATION_TYPES, type PendingNotification } from './types'

interface GetUserPendingNotificationsParams {
  userId: string
}

export async function getUserPendingNotifications({
  userId,
}: GetUserPendingNotificationsParams): Promise<PendingNotification[]> {
  const notifications: PendingNotification[] = []

  const invitations = await getPendingInvitationsForUser(userId)

  if (!invitations.length) return notifications

  invitations.slice(0, NOTIFICATIONS_LIMITS.INVITATIONS_PER_USER).forEach((invitation) => {
    const organizationName = invitation.organization?.name

    notifications.push({
      id: `invitation:${invitation.id}`,
      type: NOTIFICATION_TYPES.INVITATION_PENDING,
      createdAt: invitation.createdAt,
      meta: {
        organizationName,
        invitationId: invitation.id,
      },
    })
  })

  return notifications
}
