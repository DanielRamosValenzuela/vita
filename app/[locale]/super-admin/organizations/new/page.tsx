import { ArrowLeft } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { Button } from '@/src/shared/ui/button'
import { CreateOrganizationForm } from '@/src/features/super-admin/ui/create-organization-form'
import { requireSuperAdmin } from '@/src/shared/lib/auth/session'

const NewOrganizationPage = async () => {
  await requireSuperAdmin()
  const t = await getTranslations('superAdmin.createOrganization')

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/super-admin/organizations">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
      </div>

      <CreateOrganizationForm />
    </div>
  )
}

export default NewOrganizationPage
