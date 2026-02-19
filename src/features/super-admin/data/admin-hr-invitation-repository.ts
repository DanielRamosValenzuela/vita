import { Role } from '@prisma/client'

import {
  createInvitation as createInvitationEntity,
  deleteInvitation,
} from '@/src/entities/invitation'
import { checkOrganizationRoleLimit } from '@/src/entities/organization'

export async function createAdminHRInvitation(
  organizationId: string,
  userId: string,
  invitedBy: string
) {
  return await createInvitationEntity(organizationId, userId, Role.ADMIN_HR, invitedBy)
}

export async function checkOrganizationAdminHRLimit(organizationId: string) {
  return await checkOrganizationRoleLimit(organizationId, Role.ADMIN_HR)
}

export { deleteInvitation }
