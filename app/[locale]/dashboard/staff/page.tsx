import { getTranslations } from 'next-intl/server'

import { getStaffPageDataAction } from '@/src/features/admin-hr/api'
import { StaffViewPage } from '@/src/features/admin-hr/ui'
import { requireAdminHROrChiefArea } from '@/src/shared/lib/auth'
import { Alert, AlertDescription, AlertTitle } from '@/src/shared/ui/alert'

interface StaffPageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: StaffPageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'dashboard' })

  return {
    title: `${t('staff')} | VITA`,
    description: t('staffCardDescription'),
  }
}

export default async function StaffPage({ params }: StaffPageProps) {
  const { locale } = await params
  await requireAdminHROrChiefArea(locale)
  const t = await getTranslations('dashboard')

  const result = await getStaffPageDataAction()

  if (!result.success || !result.data)
    return (
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">{t('staff')}</h1>
          <p className="text-muted-foreground mt-2">{t('staffDescription')}</p>
        </div>
        <p className="text-muted-foreground">{t('staffComingSoon')}</p>
      </div>
    )

  const { staff } = result.data

  if (staff.length === 0)
    return (
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">{t('staff')}</h1>
          <p className="text-muted-foreground mt-2">{t('staffDescription')}</p>
        </div>
        <Alert variant="default">
          <AlertTitle>{t('staff')}</AlertTitle>
          <AlertDescription>{t('staffNoAreasAssigned')}</AlertDescription>
        </Alert>
      </div>
    )

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('staff')}</h1>
        <p className="text-muted-foreground mt-2">{t('staffDescription')}</p>
      </div>

      <StaffViewPage staff={staff} />
    </div>
  )
}
