import { getTranslations } from 'next-intl/server'

import { requireAdminHR } from '@/src/shared/lib/auth'
import { CreateSectorForm } from '@/src/features/sector/ui'

interface NewSectorPageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: NewSectorPageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'adminHR.sectors' })

  return {
    title: `${t('createTitle')} | VITA`,
    description: t('createDescription'),
  }
}

export default async function NewSectorPage({ params }: NewSectorPageProps) {
  const { locale } = await params
  const [, t] = await Promise.all([requireAdminHR(locale), getTranslations('adminHR.sectors')])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('createTitle')}</h1>
        <p className="text-muted-foreground mt-2">{t('createDescription')}</p>
      </div>

      <CreateSectorForm />
    </div>
  )
}
