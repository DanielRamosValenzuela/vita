import { notFound } from 'next/navigation'

import { getTranslations } from 'next-intl/server'

import { requireAdminHR } from '@/src/shared/lib/auth'
import { getAreaById } from '@/src/entities/area'
import { getShiftTypesAction } from '@/src/features/shifts/api'
import { AreaEditForm } from '@/src/features/admin-hr/ui'

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

  const allShiftTypes = shiftTypesResult.success && shiftTypesResult.data ? shiftTypesResult.data : []
  const areaShiftTypeIds = new Set(area.shiftTypes.map((ast) => ast.shiftType.id))
  const shiftTypes = allShiftTypes.filter(
    (st) => st.isGlobal || areaShiftTypeIds.has(st.id)
  ).map((st) => ({
    id: st.id,
    name: st.name,
    durationMinutes: st.durationMinutes,
    classification: st.classification,
    color: st.color,
    icon: st.icon ?? undefined,
  }))

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
