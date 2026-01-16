import { InvitationStatus } from '@prisma/client'

export const INVITATION_STATUS = {
  PENDING: 'PENDING' as InvitationStatus,
  ACCEPTED: 'ACCEPTED' as InvitationStatus,
  REJECTED: 'REJECTED' as InvitationStatus,
  EXPIRED: 'EXPIRED' as InvitationStatus,
} as const
