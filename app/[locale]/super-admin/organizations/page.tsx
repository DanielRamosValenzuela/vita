import { requireSuperAdmin } from '@/src/shared/lib/auth/session'

interface OrganizationsPageProps {
  params: Promise<{ locale: string }>
}

export default async function OrganizationsPage({ params }: OrganizationsPageProps) {
  const { locale } = await params
  await requireSuperAdmin(locale)

  return (
    <div>
      <h1 className="text-3xl font-bold">Organizaciones</h1>
      <p className="text-muted-foreground mt-2">
        Lista completa de organizaciones (En desarrollo)
      </p>
    </div>
  )
}


