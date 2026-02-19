'use client'

import { InvitationsTableWithCancel, type InvitationWithUser } from '@/src/shared/ui/molecules'

import { cancelInvitationAction } from '../api/admin-hr-invitation-actions'

interface InvitationsTableProps {
  invitations: InvitationWithUser[]
  translationNamespace: string
}

export function InvitationsTable({ invitations, translationNamespace }: InvitationsTableProps) {
  return (
    <InvitationsTableWithCancel
      invitations={invitations}
      translationNamespace={translationNamespace}
      onCancelInvitation={cancelInvitationAction}
    />
  )
}
