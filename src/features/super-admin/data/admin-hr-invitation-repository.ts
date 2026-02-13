import { Role } from '@prisma/client'

import {
  createInvitation as createInvitationEntity,
  deleteInvitation,
  getAllInvitationsForOrganization as getAllInvitationsForOrganizationEntity,
  getPendingInvitationsForOrganization as getPendingInvitationsForOrganizationEntity,
} from '@/src/entities/invitation'
import { checkOrganizationRoleLimit } from '@/src/entities/organization'

export async function getPendingInvitationsForOrganization(organizationId: string) {
  return await getPendingInvitationsForOrganizationEntity(organizationId, Role.ADMIN_HR)
}

export async function getAllInvitationsForOrganization(organizationId: string) {
  return await getAllInvitationsForOrganizationEntity(organizationId, Role.ADMIN_HR)
}

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
