import { requireSuperAdmin } from '@/src/shared/lib/auth/session'

interface AnalyticsPageProps {
  params: Promise<{ locale: string }>
}

export default async function AnalyticsPage({ params }: AnalyticsPageProps) {
  const { locale } = await params
  await requireSuperAdmin(locale)

  return (
    <div>
      <h1 className="text-3xl font-bold">Analytics</h1>
      <p className="text-muted-foreground mt-2">
        Gráficos y reportes globales (En desarrollo)
      </p>
    </div>
  )
}

