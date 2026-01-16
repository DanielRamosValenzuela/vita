import type { Country, OrganizationInvitation } from '@prisma/client'

import { prisma } from '@/src/shared/lib/auth/config'

export interface InvitationWithUser extends OrganizationInvitation {
  user: {
    id: string
    name: string
    email: string
  } | null
}

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
              role: 'ADMIN_HR',
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
        role: 'CHIEF_AREA',
      },
    }),
    prisma.user.count({
      where: {
        organizationId,
        role: 'STAFF_HEALTH',
      },
    }),
    prisma.organizationInvitation.count({
      where: {
        organizationId,
        role: 'CHIEF_AREA',
        status: 'PENDING',
      },
    }),
    prisma.organizationInvitation.count({
      where: {
        organizationId,
        role: 'STAFF_HEALTH',
        status: 'PENDING',
      },
    }),
    prisma.organizationInvitation.findMany({
      where: {
        organizationId,
        role: {
          in: ['CHIEF_AREA', 'STAFF_HEALTH'],
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
        role: 'CHIEF_AREA',
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
        role: 'STAFF_HEALTH',
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
