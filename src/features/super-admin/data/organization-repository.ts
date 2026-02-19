import type { Country, OrganizationPlan, OrganizationStatus, Prisma } from '@prisma/client'

import { ROLES } from '@/src/shared/lib/constants'
import { prisma } from '@/src/shared/lib/db'

type OrganizationWithDetails = Prisma.OrganizationGetPayload<{
  include: {
    users: { select: { id: true; name: true; email: true; role: true; createdAt: true } }
    invitations: {
      include: { user: { select: { id: true; name: true; email: true } } }
    }
    _count: { select: { users: true } }
  }
}>

interface GetOrganizationsParams {
  search?: string
  status?: OrganizationStatus
  plan?: OrganizationPlan
  country?: Country
  page?: number
  pageSize?: number
}

export const getOrganizations = async (params: GetOrganizationsParams = {}) => {
  const { search = '', status, plan, country, page = 1, pageSize = 20 } = params

  const skip = (page - 1) * pageSize

  const where: Prisma.OrganizationWhereInput = {}

  if (search)
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { taxId: { contains: search, mode: 'insensitive' } },
      { contactEmail: { contains: search, mode: 'insensitive' } },
    ]

  if (status) where.status = status

  if (plan) where.plan = plan

  if (country) where.country = country

  const [organizations, total] = await Promise.all([
    prisma.organization.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            users: true,
          },
        },
        users: {
          select: {
            role: true,
          },
        },
      },
    }),
    prisma.organization.count({ where }),
  ])

  return {
    organizations,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

export const getOrganizationById = async (id: string): Promise<OrganizationWithDetails | null> => {
  const organization = await prisma.organization.findUnique({
    where: { id },
    include: {
      users: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      },
      invitations: {
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
      },
      _count: {
        select: {
          users: true,
        },
      },
    },
  })

  return organization
}

export const checkTaxIdExists = async (taxId: string, excludeId?: string) => {
  const where: Prisma.OrganizationWhereInput = { taxId }

  if (excludeId) where.id = { not: excludeId }

  const count = await prisma.organization.count({ where })
  return count > 0
}

export const createOrganization = async (data: {
  name: string
  taxId: string
  country: Country
  plan: OrganizationPlan
  monthlyFee: number
  maxAdminHR: number
  maxChiefs: number
  maxStaff: number
  contactName: string
  contactEmail: string
  contactPhone?: string
  address?: string
}) => {
  const nextPayment = new Date()
  nextPayment.setDate(nextPayment.getDate() + 30)

  const organization = await prisma.organization.create({
    data: {
      ...data,
      status: 'ACTIVE',
      nextPayment,
    },
  })

  return organization
}

export const updateOrganization = async (
  id: string,
  data: {
    name?: string
    taxId?: string
    country?: Country
    plan?: OrganizationPlan
    monthlyFee?: number
    maxAdminHR?: number
    maxChiefs?: number
    maxStaff?: number
    status?: OrganizationStatus
    contactName?: string
    contactEmail?: string
    contactPhone?: string
    address?: string
  }
) => {
  if (data.taxId) {
    const taxIdExists = await checkTaxIdExists(data.taxId, id)
    if (taxIdExists) throw new Error('Ya existe una organización con ese RUT/Tax ID')
  }

  if (
    data.maxAdminHR !== undefined ||
    data.maxChiefs !== undefined ||
    data.maxStaff !== undefined
  ) {
    const userCounts = await prisma.user.groupBy({
      by: ['role'],
      where: {
        organizationId: id,
      },
      _count: {
        id: true,
      },
    })

    const currentAdminHR = userCounts.find((u) => u.role === ROLES.ADMIN_HR)?._count.id || 0
    const currentChiefs = userCounts.find((u) => u.role === ROLES.CHIEF_AREA)?._count.id || 0
    const currentStaff = userCounts.find((u) => u.role === ROLES.STAFF_HEALTH)?._count.id || 0

    if (data.maxAdminHR !== undefined && data.maxAdminHR < currentAdminHR)
      throw new Error(
        `No puedes reducir el límite de Admin HR a ${data.maxAdminHR} porque ya tienes ${currentAdminHR} usuarios con ese rol`
      )

    if (data.maxChiefs !== undefined && data.maxChiefs < currentChiefs)
      throw new Error(
        `No puedes reducir el límite de Jefes a ${data.maxChiefs} porque ya tienes ${currentChiefs} usuarios con ese rol`
      )

    if (data.maxStaff !== undefined && data.maxStaff < currentStaff)
      throw new Error(
        `No puedes reducir el límite de Staff a ${data.maxStaff} porque ya tienes ${currentStaff} usuarios con ese rol`
      )
  }

  const updateData = Object.fromEntries(
    Object.entries(data).filter(([_, value]) => value !== undefined)
  )

  const organization = await prisma.organization.update({
    where: { id },
    data: updateData,
  })

  return organization
}

export const changeOrganizationStatus = async (id: string, status: OrganizationStatus) => {
  const organization = await prisma.organization.update({
    where: { id },
    data: { status },
  })

  return organization
}

export const deleteOrganization = async (id: string) => {
  const organization = await prisma.organization.update({
    where: { id },
    data: { status: 'INACTIVE' },
  })

  return organization
}

export const getOrganizationStats = async () => {
  const [total, activeCount, suspendedCount, pendingPaymentCount] = await Promise.all([
    prisma.organization.count(),
    prisma.organization.count({ where: { status: 'ACTIVE' } }),
    prisma.organization.count({ where: { status: 'SUSPENDED' } }),
    prisma.organization.count({ where: { status: 'PENDING_PAYMENT' } }),
  ])

  const activePercentage = total > 0 ? (activeCount / total) * 100 : 0
  const suspendedPercentage = total > 0 ? (suspendedCount / total) * 100 : 0

  return {
    total,
    activeCount,
    activePercentage,
    suspendedCount,
    suspendedPercentage,
    pendingPaymentCount,
  }
}

export const getDashboardStats = async () => {
  const totalOrgs = await prisma.organization.count()
  const activeOrgs = await prisma.organization.count({
    where: { status: 'ACTIVE' },
  })
  const suspendedOrgs = await prisma.organization.count({
    where: { status: 'SUSPENDED' },
  })
  const totalUsers = await prisma.user.count({
    where: {
      organizationId: { not: null },
    },
  })

  const sevenDaysFromNow = new Date()
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)

  const upcomingPayments = await prisma.organization.count({
    where: {
      status: 'ACTIVE',
      nextPayment: {
        lte: sevenDaysFromNow,
        gte: new Date(),
      },
    },
  })

  return {
    totalOrgs,
    activeOrgs,
    suspendedOrgs,
    totalUsers,
    upcomingPayments,
  }
}

export const getRecentOrganizations = async (limit = 5) => {
  const organizations = await prisma.organization.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      status: true,
      plan: true,
      maxStaff: true,
      _count: {
        select: { users: true },
      },
    },
  })

  return organizations.map((org) => ({
    id: org.id,
    name: org.name,
    status: org.status,
    plan: org.plan,
    userCount: org._count.users,
    maxUsers: org.maxStaff,
  }))
}
