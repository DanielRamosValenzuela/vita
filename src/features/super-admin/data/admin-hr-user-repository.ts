import { type Prisma } from '@prisma/client'
import bcrypt from 'bcryptjs'

import { ROLES } from '@/src/shared/lib/constants'
import { prisma } from '@/src/shared/lib/db'

import type { UpdateAdminHRUserInput } from '../lib/schemas'

export async function getAdminHRUserById(id: string) {
  return await prisma.user.findUnique({
    where: { id, role: ROLES.ADMIN_HR },
    include: {
      organization: true,
    },
  })
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
