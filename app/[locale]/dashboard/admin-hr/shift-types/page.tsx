import { getTranslations } from 'next-intl/server'

import { requireAdminHR } from '@/src/shared/lib/auth'

interface AdminHRShiftTypesPageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: AdminHRShiftTypesPageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'adminHR.shiftTypes' })

  return {
    title: `${t('title')} | VITA`,
    description: t('description'),
  }
}

export default async function AdminHRShiftTypesPage({ params }: AdminHRShiftTypesPageProps) {
  const { locale } = await params
  await requireAdminHR(locale)
  const t = await getTranslations('adminHR.shiftTypes')

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground mt-2">{t('description')}</p>
      </div>

      <div className="bg-muted rounded-lg border p-8 text-center">
        <p className="text-muted-foreground">{t('comingSoon')}</p>
      </div>
    </div>
  )
}
