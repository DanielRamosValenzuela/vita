import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { Role } from '@prisma/client'
import { authOptions } from './config'
import { prisma } from './config'
import type { CurrentUser } from './types'

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return null
  }

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    image: session.user.image,
    role: session.user.role,
    organizationId: session.user.organizationId,
    country: session.user.country,
    docType: session.user.docType,
    docNumber: session.user.docNumber,
  }
}

export async function requireAuth(): Promise<CurrentUser> {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  return user
}

export async function requireSuperAdmin(): Promise<CurrentUser> {
  const user = await requireAuth()

  if (user.role !== Role.SUPER_ADMIN) {
    redirect('/unauthorized')
  }

  return user
}

export async function getUserWithOrganization(
  userId: string
): Promise<CurrentUser & { organization: { id: string; name: string } | null } | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })

  if (!user) {
    return null
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image || undefined,
    role: user.role,
    organizationId: user.organizationId || undefined,
    country: user.country || undefined,
    docType: user.docType || undefined,
    docNumber: user.docNumber || undefined,
    organization: user.organization
      ? {
          id: user.organization.id,
          name: user.organization.name,
        }
      : null,
  }
}
