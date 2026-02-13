import { Country, DocType, type Prisma } from '@prisma/client'
import bcrypt from 'bcryptjs'

import { ROLES } from '@/src/shared/lib/constants'
import { prisma } from '@/src/shared/lib/db'

import type { CreateAdminHRUserInput, UpdateAdminHRUserInput } from '../lib/schemas'

interface GetAdminHRUsersParams {
  search?: string
  organizationId?: string
  page?: number
  pageSize?: number
}

export async function getAdminHRUsers(params: GetAdminHRUsersParams = {}) {
  const { search = '', organizationId, page = 1, pageSize = 20 } = params

  const skip = (page - 1) * pageSize

  const where: Prisma.UserWhereInput = {
    role: ROLES.ADMIN_HR,
  }

  if (search)
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ]

  if (organizationId) where.organizationId = organizationId

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ])

  return {
    users,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

export async function getAdminHRUserById(id: string) {
  return await prisma.user.findFirst({
    where: { id, role: ROLES.ADMIN_HR },
    include: {
      organization: true,
    },
  })
}

export async function createAdminHRUser(data: CreateAdminHRUserInput) {
  const hashedPassword = await bcrypt.hash(data.password, 12)

  const cleanDocNumber = data.docNumber?.replace(/[.-]/g, '') || null

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      role: ROLES.ADMIN_HR,
      organizationId: data.organizationId,
      country: (data.country as Country) || null,
      docType: (data.docType as DocType) || null,
      docNumber: cleanDocNumber,
    },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })

  await prisma.account.create({
    data: {
      userId: user.id,
      type: 'credentials',
      provider: 'credentials',
      providerAccountId: user.id,
      access_token: hashedPassword,
    },
  })

  return user
}

export async function updateAdminHRUser(id: string, data: UpdateAdminHRUserInput) {
  const updateData: Prisma.UserUpdateInput = {}

  if (data.name !== undefined) updateData.name = data.name
  if (data.email !== undefined) updateData.email = data.email
  if (data.organizationId !== undefined)
    updateData.organization = data.organizationId
      ? { connect: { id: data.organizationId } }
      : { disconnect: true }

  if (data.password) {
    const hashedPassword = await bcrypt.hash(data.password, 12)
    await prisma.account.updateMany({
      where: {
        userId: id,
        provider: 'credentials',
      },
      data: {
        access_token: hashedPassword,
      },
    })
  }

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
    include: {
      organization: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })

  return user
}

export async function deleteAdminHRUser(id: string) {
  await prisma.user.delete({
    where: { id },
  })
}

export async function checkEmailExists(email: string, excludeId?: string): Promise<boolean> {
  const user = await prisma.user.findFirst({
    where: {
      email,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
  })
  return !!user
}
