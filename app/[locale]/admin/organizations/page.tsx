import { requireSuperAdmin } from '@/lib/auth/session'

interface OrganizationsPageProps {
  params: Promise<{ locale: string }>
}

export default async function OrganizationsPage({ params }: OrganizationsPageProps) {
  const { locale } = await params
  await requireSuperAdmin(locale)

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold">Hola mundo - Organizaciones</h1>
      <p className="mt-4 text-muted-foreground">Locale: {locale}</p>
    </div>
  )
}

