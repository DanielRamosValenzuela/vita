import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'

import { requireSuperAdmin } from '@/src/shared/lib/auth/session'
import { prisma } from '@/src/shared/lib/db'
import { getAdminHRUserById } from '@/src/features/super-admin/data'
import { EditAdminHRUserForm } from '@/src/features/super-admin/ui'

interface EditAdminHRUserPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata() {
  const t = await getTranslations('superAdmin.editAdminHRUser')
  return {
    title: `${t('title')} | VITA`,
    description: t('description'),
  }
}

export default async function EditAdminHRUserPage({ params }: EditAdminHRUserPageProps) {
  const [, t, { id }] = await Promise.all([
    requireSuperAdmin(),
    getTranslations('superAdmin.editAdminHRUser'),
    params,
  ])
  const [user, organizations] = await Promise.all([
    getAdminHRUserById(id),
    prisma.organization.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { name: 'asc' },
    }),
  ])

  if (!user) notFound()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground mt-2">{t('subtitle', { name: user.name })}</p>
      </div>

      <EditAdminHRUserForm user={user} organizations={organizations} />
    </div>
  )
}
