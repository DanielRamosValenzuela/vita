import { getTranslations } from 'next-intl/server'
import { requireAdminHR } from '@/src/shared/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/shared/ui/card'

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
  await requireAdminHR(locale)
  const t = await getTranslations('adminHR.areas')

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground mt-2">{t('description')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{t('comingSoon')}</p>
        </CardContent>
      </Card>
    </div>
  )
}
