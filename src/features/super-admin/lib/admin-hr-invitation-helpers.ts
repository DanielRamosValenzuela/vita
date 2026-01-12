import { prisma } from '@/src/shared/lib/auth/config'
import type { Country, DocType } from '@prisma/client'

interface SearchUserParams {
  search: string
  country?: Country
}

export async function searchUserByRUTOrEmail({ search, country }: SearchUserParams) {
  const cleanSearch = search.trim()

  if (!cleanSearch) {
    return null
  }

  const cleanDocNumber = cleanSearch.replace(/[.-]/g, '')

  const whereConditions: any[] = [{ email: { equals: cleanSearch, mode: 'insensitive' } }]

  if (cleanDocNumber) {
    const docCondition: any = { docNumber: cleanDocNumber }
    if (country) {
      docCondition.country = country
    }
    whereConditions.push(docCondition)
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: whereConditions,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      country: true,
      docType: true,
      docNumber: true,
      organizationId: true,
      organization: {
        select: {
          id: true,
          name: true,
        },
      },
      createdAt: true,
    },
  })

  return user
}

export async function getPendingInvitationsForOrganization(organizationId: string) {
  return await prisma.organizationInvitation.findMany({
    where: {
      organizationId,
      role: 'ADMIN_HR',
      status: 'PENDING',
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          docNumber: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getAllInvitationsForOrganization(organizationId: string) {
  return await prisma.organizationInvitation.findMany({
    where: {
      organizationId,
      role: 'ADMIN_HR',
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          docNumber: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function createAdminHRInvitation(
  organizationId: string,
  userId: string,
  invitedBy: string
) {
  const existingInvitation = await prisma.organizationInvitation.findUnique({
    where: {
      organizationId_userId_role: {
        organizationId,
        userId,
        role: 'ADMIN_HR',
      },
    },
  })

  if (existingInvitation) {
    if (existingInvitation.status === 'PENDING') {
      return { success: false, error: 'Ya existe una invitación pendiente para este usuario' }
    }
    if (existingInvitation.status === 'ACCEPTED') {
      return { success: false, error: 'Este usuario ya es ADMIN_HR de esta organización' }
    }
  }

  const invitation = await prisma.organizationInvitation.create({
    data: {
      organizationId,
      userId,
      role: 'ADMIN_HR',
      invitedBy,
      status: 'PENDING',
    },
  })

  return { success: true, data: invitation }
}

export async function checkOrganizationAdminHRLimit(organizationId: string) {
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: {
      maxAdminHR: true,
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
    return { success: false, error: 'Organización no encontrada' }
  }

  const currentCount = organization._count.users
  const maxLimit = organization.maxAdminHR

  return {
    success: true,
    currentCount,
    maxLimit,
    canAddMore: currentCount < maxLimit,
  }
}
