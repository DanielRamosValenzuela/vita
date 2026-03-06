import { getTranslations } from 'next-intl/server'
import { Role } from '@prisma/client'

import { requireAdminHROrChief } from '@/src/shared/lib/auth/session'
import { getAreasAction } from '@/src/features/area/api'
import { getShiftTypesAction } from '@/src/features/shifts/api'
import { ShiftTypesPage } from '@/src/features/shifts/ui'

interface ShiftTypesProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: ShiftTypesProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'shifts.shiftTypes' })

  return {
    title: `${t('title')} | VITA`,
    description: t('description'),
  }
}

export default async function ShiftTypes({ params }: ShiftTypesProps) {
  const { locale } = await params
  const [session, t] = await Promise.all([
    requireAdminHROrChief(locale),
    getTranslations('shifts.shiftTypes'),
  ])

  const isAdminHR = session.role === Role.ADMIN_HR
  if (isAdminHR && !session.organizationId)
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground mt-2">{t('noOrganization')}</p>
        </div>
      </div>
    )

  const [shiftTypesResult, areasResult] = await Promise.all([
    getShiftTypesAction(),
    getAreasAction(),
  ])

  const areas =
    areasResult.success && Array.isArray(areasResult.data)
      ? areasResult.data.map((a: { id: string; name: string }) => ({ id: a.id, name: a.name }))
      : []

  if (!shiftTypesResult.success || !shiftTypesResult.data)
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground mt-2">{t('loadError')}</p>
        </div>
      </div>
    )

  const shiftTypes = shiftTypesResult.data

  return (
    <ShiftTypesPage
      shiftTypes={shiftTypes || []}
      areas={areas}
      canCreateGlobal={isAdminHR}
      isChief={session.role === Role.CHIEF_AREA}
    />
  )
}
