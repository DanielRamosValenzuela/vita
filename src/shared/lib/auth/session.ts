import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { Role } from '@prisma/client'

import { prisma } from '@/src/shared/lib/db'
import { authOptions } from './config'
import type { CurrentUser } from './types'

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await getServerSession(authOptions)

  if (!session?.user) return null

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    image: session.user.image,
    customImage: session.user.customImage,
    role: session.user.role,
    organizationId: session.user.organizationId,
    country: session.user.country,
    docType: session.user.docType,
    docNumber: session.user.docNumber,
  }
}

export async function requireAuth(locale: string = 'es'): Promise<CurrentUser> {
  const user = await getCurrentUser()

  if (!user) redirect(`/${locale}/login`)

  return user
}

export async function requireSuperAdmin(locale: string = 'es'): Promise<CurrentUser> {
  const user = await requireAuth(locale)

  if (user.role !== Role.SUPER_ADMIN) 
    redirect(`/${locale}/dashboard`)
  

  return user
}

export async function requireAdminHR(locale: string = 'es'): Promise<CurrentUser> {
  const user = await requireAuth(locale)

  if (user.role !== Role.ADMIN_HR)
    redirect(`/${locale}/dashboard`)

  return user
}

export async function requireAdminHRWithOrg(
  locale: string = 'es'
): Promise<CurrentUser & { organizationId: string }> {
  const user = await requireAdminHR(locale)

  if (!user.organizationId)
    throw new Error('No estás vinculado a una organización')

  return user as CurrentUser & { organizationId: string }
}

export async function requireChiefArea(locale: string = 'es'): Promise<CurrentUser> {
  const user = await requireAuth(locale)

  if (user.role !== Role.CHIEF_AREA)
    redirect(`/${locale}/dashboard`)

  return user
}

export async function requireAdminHROrChiefArea(
  locale: string = 'es'
): Promise<CurrentUser & { organizationId: string | null }> {
  const user = await requireAuth(locale)

  if (user.role !== Role.ADMIN_HR && user.role !== Role.CHIEF_AREA)
    redirect(`/${locale}/dashboard`)

  if (user.role === Role.ADMIN_HR && !user.organizationId)
    throw new Error('No estás vinculado a una organización')

  return user as CurrentUser & { organizationId: string | null }
}

export async function requireStaffHealth(locale: string = 'es'): Promise<CurrentUser> {
  const user = await requireAuth(locale)

  if (user.role !== Role.STAFF_HEALTH) 
    redirect(`/${locale}/dashboard`)
  

  return user
}

export async function getUserWithOrganization(
  userId: string
): Promise<(CurrentUser & { organization: { id: string; name: string } | null }) | null> {
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

  if (!user) return null

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image || undefined,
    customImage: user.customImage || undefined,
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
