import type { Role } from '@prisma/client'

import {
  createInvitation as createInvitationEntity,
  getAllInvitationsForOrganization as getAllInvitationsForOrganizationEntity,
} from '@/src/entities/invitation'
import { checkOrganizationRoleLimit } from '@/src/entities/organization'

export async function checkOrganizationLimit(
  organizationId: string,
  role: 'CHIEF_AREA' | 'STAFF_HEALTH'
) {
  return await checkOrganizationRoleLimit(organizationId, role)
}

export async function createInvitation(
  organizationId: string,
  userId: string,
  role: 'CHIEF_AREA' | 'STAFF_HEALTH',
  invitedBy: string
) {
  return await createInvitationEntity(organizationId, userId, role, invitedBy)
}

export async function getAllInvitationsForOrganization(
  organizationId: string,
  role?: Role
) {
  return await getAllInvitationsForOrganizationEntity(organizationId, role)
}
