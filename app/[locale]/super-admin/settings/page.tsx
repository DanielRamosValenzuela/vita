import { requireSuperAdmin } from '@/src/shared/lib/auth/session'

interface SettingsPageProps {
  params: Promise<{ locale: string }>
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { locale } = await params
  await requireSuperAdmin(locale)

  return (
    <div>
      <h1 className="text-3xl font-bold">Configuración</h1>
      <p className="text-muted-foreground mt-2">Configuración del sistema (En desarrollo)</p>
    </div>
  )
}
