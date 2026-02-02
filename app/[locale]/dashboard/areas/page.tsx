import { getTranslations } from 'next-intl/server'
import { Role } from '@prisma/client'

import { getAreasAction } from '@/src/features/admin-hr/api'
import { AreasTable } from '@/src/features/admin-hr/ui'
import { requireAdminHROrChiefArea } from '@/src/shared/lib/auth'

interface AreasPageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: AreasPageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'adminHR.areas' })

  return {
    title: `${t('title')} | VITA`,
    description: t('description'),
  }
}

export default async function AreasPage({ params }: AreasPageProps) {
  const { locale } = await params
  const user = await requireAdminHROrChiefArea(locale)
  const t = await getTranslations('adminHR.areas')

  if (!user.organizationId)
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground mt-2">{t('description')}</p>
        </div>
        <div className="bg-destructive/10 text-destructive border-destructive/20 rounded-lg border p-4">
          {t('noOrganization')}
        </div>
      </div>
    )

  const result = await getAreasAction()
  const areas = (result.success && result.data ? result.data : []) as Array<{
    id: string
    name: string
    description: string | null
    icon: string | null
    color: string
    isActive: boolean
    _count?: { shiftTypes: number }
  }>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground mt-2">{t('description')}</p>
      </div>

      <AreasTable
        areas={areas}
        canCreate={user.role === Role.ADMIN_HR}
        canDelete={user.role === Role.ADMIN_HR}
      />
    </div>
  )
}
