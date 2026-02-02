import { getTranslations } from 'next-intl/server'
import { notFound, redirect } from 'next/navigation'

import { requireSuperAdmin } from '@/src/shared/lib/auth/session'
import { getOrganizationById } from '@/src/features/super-admin/data'
import { EditOrganizationForm } from '@/src/features/super-admin/ui'

interface EditOrganizationPageProps {
  params: Promise<{
    locale: string
    id: string
  }>
}

export async function generateMetadata({ params }: EditOrganizationPageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'superAdmin.organizations' })

  return {
    title: `${t('edit')} | VITA`,
    description: t('editDescription'),
  }
}

export default async function EditOrganizationPage({ params }: EditOrganizationPageProps) {
  const { id, locale } = await params
  const user = await requireSuperAdmin()
  if (!user) 
    redirect(`/${locale}/login`)
  
  const t = await getTranslations({ locale, namespace: 'superAdmin.editOrganization' })
  const organization = await getOrganizationById(id)

  if (!organization) 
    notFound()
  

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground mt-2">{t('subtitle', { name: organization.name })}</p>
      </div>

      <EditOrganizationForm organization={organization} />
    </div>
  )
}
