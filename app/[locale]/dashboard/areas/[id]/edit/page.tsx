import { notFound } from 'next/navigation'

import { getTranslations } from 'next-intl/server'

import { requireAdminHR } from '@/src/shared/lib/auth'
import { getAreaById } from '@/src/features/admin-hr/data/area-repository'
import { getShiftTypesAction } from '@/src/features/shifts/api/shift-type-actions'
import { AreaEditForm } from '@/src/features/admin-hr/ui/area-edit-form'

interface AreaEditPageProps {
  params: Promise<{ locale: string; id: string }>
}

export async function generateMetadata({ params }: AreaEditPageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'adminHR.areas' })

  return {
    title: `${t('editTitle')} | VITA`,
    description: t('editDescription'),
  }
}

export default async function AreaEditPage({ params }: AreaEditPageProps) {
  const { locale, id } = await params
  const user = await requireAdminHR(locale)
  const t = await getTranslations('adminHR.areas')

  if (!user.organizationId)
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('editTitle')}</h1>
          <p className="text-muted-foreground mt-2">{t('noOrganization')}</p>
        </div>
      </div>
    )

  const [area, shiftTypesResult] = await Promise.all([
    getAreaById(id, user.organizationId),
    getShiftTypesAction(),
  ])

  if (!area)
    notFound()

  const shiftTypes = shiftTypesResult.success && shiftTypesResult.data ? shiftTypesResult.data : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('editTitle')}</h1>
        <p className="text-muted-foreground mt-2">{t('editDescription')}</p>
      </div>

      <AreaEditForm
        area={area}
        shiftTypes={shiftTypes}
      />
    </div>
  )
}
