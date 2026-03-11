import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { Role } from '@prisma/client'

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

  if (user.role !== Role.SUPER_ADMIN) redirect(`/${locale}/dashboard`)

  return user
}

export async function requireAdminHR(locale: string = 'es'): Promise<CurrentUser> {
  const user = await requireAuth(locale)

  if (user.role !== Role.ADMIN_HR) redirect(`/${locale}/dashboard`)

  return user
}

export async function requireAdminHRWithOrg(
  locale: string = 'es'
): Promise<CurrentUser & { organizationId: string }> {
  const user = await requireAdminHR(locale)

  if (!user.organizationId) throw new Error('No estás vinculado a una organización')

  return user as CurrentUser & { organizationId: string }
}

export async function requireAdminHROrChief(
  locale: string = 'es'
): Promise<CurrentUser & { organizationId: string | null }> {
  const user = await requireAuth(locale)
  const isAdminHR = user.role === Role.ADMIN_HR
  const isChief = user.role === Role.CHIEF_AREA

  if (!isAdminHR && !isChief) redirect(`/${locale}/dashboard`)

  if (isAdminHR && !user.organizationId) throw new Error('No estás vinculado a una organización')

  return user as CurrentUser & { organizationId: string | null }
}

export async function requireDashboardUser(
  locale: string = 'es'
): Promise<CurrentUser & { organizationId: string | null }> {
  const user = await requireAuth(locale)
  const allowed =
    user.role === Role.ADMIN_HR ||
    user.role === Role.CHIEF_AREA ||
    user.role === Role.STAFF

  if (!allowed) redirect(`/${locale}/dashboard`)

  if (user.role === Role.ADMIN_HR && !user.organizationId)
    throw new Error('No estás vinculado a una organización')

  return user as CurrentUser & { organizationId: string | null }
}
