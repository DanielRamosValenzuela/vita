import { prisma } from '@/src/shared/lib/auth/config'
import type { Prisma } from '@prisma/client'
import type { OrganizationPlan, OrganizationStatus, Country } from '@prisma/client'

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

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { taxId: { contains: search, mode: 'insensitive' } },
      { contactEmail: { contains: search, mode: 'insensitive' } },
    ]
  }

  if (status) {
    where.status = status
  }

  if (plan) {
    where.plan = plan
  }

  if (country) {
    where.country = country
  }

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

export const getOrganizationById = async (id: string) => {
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

  if (excludeId) {
    where.id = { not: excludeId }
  }

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
  const organization = await prisma.organization.update({
    where: { id },
    data,
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
