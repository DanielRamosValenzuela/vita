import { getTranslations } from 'next-intl/server'
import { ArrowLeft } from 'lucide-react'

import { requireSuperAdmin } from '@/src/shared/lib/auth/session'
import { Button } from '@/src/shared/ui/button'
import { CreateOrganizationForm } from '@/src/features/super-admin/ui'

import { Link } from '@/i18n/navigation'

const NewOrganizationPage = async () => {
  await requireSuperAdmin()
  const t = await getTranslations('superAdmin.createOrganization')

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/organizations">
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
