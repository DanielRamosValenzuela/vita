import bcrypt from 'bcryptjs'
import { prisma } from '@/src/shared/lib/auth'
import { Country, DocType } from '@prisma/client'
import type { RegisterInput } from './schemas'

export async function checkEmailExists(email: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { email },
  })
  return !!user
}

export async function checkDocExists(
  country: Country,
  docType: DocType,
  docNumber: string
): Promise<boolean> {
  const user = await prisma.user.findFirst({
    where: {
      country,
      docType,
      docNumber,
    },
  })
  return !!user
}

export async function createUserWithAccount(data: RegisterInput) {
  const hashedPassword = await bcrypt.hash(data.password, 12)
  const cleanDocNumber = data.rut.replace(/[.-]/g, '')

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      country: data.country,
      docType: data.docType,
      docNumber: cleanDocNumber,
      role: 'STAFF_HEALTH',
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
  return await prisma.user.findUnique({
    where: { email },
    include: {
      accounts: {
        where: {
          provider: 'credentials',
        },
      },
    },
  })
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}

