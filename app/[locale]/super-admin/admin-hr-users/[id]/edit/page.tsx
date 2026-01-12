import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { requireSuperAdmin } from '@/src/shared/lib/auth/session'
import { EditAdminHRUserForm } from '@/src/features/super-admin/ui/edit-admin-hr-user-form'
import { getAdminHRUserById } from '@/src/features/super-admin/lib/admin-hr-user-helpers'
import { prisma } from '@/src/shared/lib/auth/config'

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
  await requireSuperAdmin()
  const t = await getTranslations('superAdmin.editAdminHRUser')

  const { id } = await params
  const user = await getAdminHRUserById(id)

  if (!user) {
    notFound()
  }

  const organizations = await prisma.organization.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { name: 'asc' },
  })

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
