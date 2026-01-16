import type { Country } from '@prisma/client'

import { prisma } from '@/src/shared/lib/auth/config'
import { ROLES, INVITATION_STATUS } from '@/src/shared/lib/constants'
import type { InvitationWithUser } from '@/src/shared/ui/molecules'

export type { InvitationWithUser }

export interface OrganizationStats {
  id: string
  name: string
  status: string
  country: Country
  maxAdminHR: number
  maxChiefs: number
  maxStaff: number
  currentAdminHR: number
  currentChiefs: number
  currentStaff: number
  pendingInvitations: {
    chiefs: number
    staff: number
  }
  invitations: InvitationWithUser[]
  chiefs: Array<{
    id: string
    name: string
    email: string
    createdAt: Date
  }>
  staff: Array<{
    id: string
    name: string
    email: string
    createdAt: Date
  }>
}

export async function getAdminHROrganization(organizationId: string): Promise<OrganizationStats | null> {
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: {
      id: true,
      name: true,
      status: true,
      country: true,
      maxAdminHR: true,
      maxChiefs: true,
      maxStaff: true,
      _count: {
        select: {
          users: {
            where: {
              role: ROLES.ADMIN_HR,
            },
          },
        },
      },
    },
  })

  if (!organization) {
    return null
  }

  const [
    chiefsCount,
    staffCount,
    pendingChiefsInvitations,
    pendingStaffInvitations,
    invitations,
    chiefs,
    staff,
  ] = await Promise.all([
    prisma.user.count({
      where: {
        organizationId,
        role: ROLES.CHIEF_AREA,
      },
    }),
    prisma.user.count({
      where: {
        organizationId,
        role: ROLES.STAFF_HEALTH,
      },
    }),
    prisma.organizationInvitation.count({
      where: {
        organizationId,
        role: ROLES.CHIEF_AREA,
        status: INVITATION_STATUS.PENDING,
      },
    }),
    prisma.organizationInvitation.count({
      where: {
        organizationId,
        role: ROLES.STAFF_HEALTH,
        status: INVITATION_STATUS.PENDING,
      },
    }),
    prisma.organizationInvitation.findMany({
      where: {
        organizationId,
        role: {
          in: [ROLES.CHIEF_AREA, ROLES.STAFF_HEALTH],
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.findMany({
      where: {
        organizationId,
        role: ROLES.CHIEF_AREA,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.findMany({
      where: {
        organizationId,
        role: ROLES.STAFF_HEALTH,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  return {
    id: organization.id,
    name: organization.name,
    status: organization.status,
    country: organization.country,
    maxAdminHR: organization.maxAdminHR,
    maxChiefs: organization.maxChiefs,
    maxStaff: organization.maxStaff,
    currentAdminHR: organization._count.users,
    currentChiefs: chiefsCount,
    currentStaff: staffCount,
    pendingInvitations: {
      chiefs: pendingChiefsInvitations,
      staff: pendingStaffInvitations,
    },
    invitations: invitations as InvitationWithUser[],
    chiefs,
    staff,
  }
}
