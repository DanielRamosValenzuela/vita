import { getTranslations } from 'next-intl/server'

import { requireAdminHR } from '@/src/shared/lib/auth'
import { getAreas } from '@/src/features/admin-hr/data/area-repository'
import { AreasTable } from '@/src/features/admin-hr/ui'

interface AreasPageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: AreasPageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'adminHR.areas' })

  return {
    title: `${t('title')} | VITA`,
    description: t('description'),
  }
}

export default async function AreasPage({ params }: AreasPageProps) {
  const { locale } = await params
  const user = await requireAdminHR(locale)
  const t = await getTranslations('adminHR.areas')

  if (!user.organizationId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground mt-2">{t('description')}</p>
        </div>
        <div className="bg-destructive/10 text-destructive border-destructive/20 rounded-lg border p-4">
          {t('noOrganization')}
        </div>
      </div>
    )
  }

  const areas = await getAreas(user.organizationId)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground mt-2">{t('description')}</p>
      </div>

      <AreasTable areas={areas} />
    </div>
  )
}
