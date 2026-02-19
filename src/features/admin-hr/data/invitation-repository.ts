import { ROLES } from '@/src/shared/lib/constants'

import { createInvitation as createInvitationEntity } from '@/src/entities/invitation'
import { checkOrganizationRoleLimit } from '@/src/entities/organization'

export async function checkOrganizationLimit(
  organizationId: string,
  role: typeof ROLES.CHIEF_AREA | typeof ROLES.STAFF_HEALTH
) {
  return await checkOrganizationRoleLimit(organizationId, role)
}

export async function createInvitation(
  organizationId: string,
  userId: string,
  role: typeof ROLES.CHIEF_AREA | typeof ROLES.STAFF_HEALTH,
  invitedBy: string
) {
  return await createInvitationEntity(organizationId, userId, role, invitedBy)
}

