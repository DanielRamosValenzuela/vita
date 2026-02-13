import { getTranslations } from 'next-intl/server'

import { requireAdminHR } from '@/src/shared/lib/auth/session'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/shared/ui/card'
import { getShiftTypesAction } from '@/src/features/shifts/api'
import { ShiftTypesPage } from '@/src/features/shifts/ui'

import { getAreas } from '@/src/entities/area'

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
  const session = await requireAdminHR(locale)
  const t = await getTranslations('shifts.shiftTypes')

  if (!session.organizationId)
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground mt-2">{t('noOrganization')}</p>
        </div>
      </div>
    )

  const [shiftTypesResult, areas] = await Promise.all([
    getShiftTypesAction(),
    session.organizationId ? getAreas(session.organizationId) : [],
  ])

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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground mt-2">{t('description')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <ShiftTypesPage shiftTypes={shiftTypes || []} areas={areas} />
        </CardContent>
      </Card>
    </div>
  )
}
