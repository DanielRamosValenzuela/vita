import { getTranslations } from 'next-intl/server'
import { requireAdminHR } from '@/src/shared/lib/auth'
import { CreateAreaForm } from '@/src/features/admin-hr/ui'

interface NewAreaPageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: NewAreaPageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'adminHR.areas' })

  return {
    title: `${t('createTitle')} | VITA`,
    description: t('createDescription'),
  }
}

export default async function NewAreaPage({ params }: NewAreaPageProps) {
  const { locale } = await params
  await requireAdminHR(locale)
  const t = await getTranslations('adminHR.areas')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('createTitle')}</h1>
        <p className="text-muted-foreground mt-2">{t('createDescription')}</p>
      </div>

      <CreateAreaForm />
    </div>
  )
}
