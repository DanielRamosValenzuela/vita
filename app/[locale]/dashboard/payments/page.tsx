import { requireSuperAdmin } from '@/src/shared/lib/auth/session'

interface PaymentsPageProps {
  params: Promise<{ locale: string }>
}

export default async function PaymentsPage({ params }: PaymentsPageProps) {
  const { locale } = await params
  await requireSuperAdmin(locale)

  return (
    <div>
      <h1 className="text-3xl font-bold">Gestión de Pagos</h1>
      <p className="text-muted-foreground mt-2">Registro y gestión de pagos (En desarrollo)</p>
    </div>
  )
}
