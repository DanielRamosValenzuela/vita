import { getTranslations } from 'next-intl/server'
import { requireChiefArea } from '@/src/shared/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/shared/ui/card'

interface ShiftsPageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: ShiftsPageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'dashboard' })

  return {
    title: `${t('shifts')} | VITA`,
    description: 'Gestión de turnos',
  }
}

export default async function ShiftsPage({ params }: ShiftsPageProps) {
  const { locale } = await params
  await requireChiefArea(locale)
  const t = await getTranslations('dashboard')

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{t('shifts')}</h1>
        <p className="text-muted-foreground mt-2">Gestiona los turnos de tu área</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('shifts')}</CardTitle>
          <CardDescription>Gestión de turnos</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Próximamente: CRUD completo de turnos</p>
        </CardContent>
      </Card>
    </div>
  )
}
