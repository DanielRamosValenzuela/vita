'use client'

import type { Role } from '@prisma/client'

import {
  InvitationsTableWithCancel,
  type InvitationWithUser,
} from '@/src/shared/ui/molecules'

import { cancelInvitationAction } from '../api/invitation-actions'

export interface InvitationsTableProps {
  invitations: InvitationWithUser[]
  translationNamespace: string
  showRoleColumn?: boolean
  roleLabels?: Partial<Record<Role, string>>
}

export function InvitationsTable({
  invitations,
  translationNamespace,
  showRoleColumn = false,
  roleLabels,
}: InvitationsTableProps) {
  return (
    <InvitationsTableWithCancel
      invitations={invitations}
      translationNamespace={translationNamespace}
      onCancelInvitation={cancelInvitationAction}
      showRoleColumn={showRoleColumn}
      roleLabels={roleLabels}
    />
  )
}
