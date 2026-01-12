import { getTranslations } from 'next-intl/server'
import { requireChiefArea } from '@/src/shared/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/shared/ui/card'

interface StaffPageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: StaffPageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'dashboard' })

  return {
    title: `${t('staff')} | VITA`,
    description: 'Gestión de personal',
  }
}

export default async function StaffPage({ params }: StaffPageProps) {
  const { locale } = await params
  await requireChiefArea(locale)
  const t = await getTranslations('dashboard')

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{t('staff')}</h1>
        <p className="text-muted-foreground mt-2">Gestiona el personal de tu área</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('staff')}</CardTitle>
          <CardDescription>Gestión de personal</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Próximamente: CRUD completo de personal</p>
        </CardContent>
      </Card>
    </div>
  )
}
