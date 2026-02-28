import { Country, DocType } from '@prisma/client'
import bcrypt from 'bcryptjs'

import { ROLES } from '@/src/shared/lib/constants'
import { prisma } from '@/src/shared/lib/db'

import type { RegisterInput } from '../lib/schemas'

export async function checkEmailExists(email: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { email },
  })
  return !!user
}

export async function createUserWithAccount(data: RegisterInput) {
  const hashedPassword = await bcrypt.hash(data.password, 12)
  const cleanDocNumber = data.docNumber.replace(/[^a-zA-Z0-9]/g, '')

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      country: data.country as Country,
      docType: data.docType as DocType,
      docNumber: cleanDocNumber,
      role: ROLES.STAFF,
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

  return {
    email: user.email,
    name: user.name,
  }
}

export async function findUserWithCredentials(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      accounts: {
        where: {
          provider: 'credentials',
        },
      },
    },
  })

  return user
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}
