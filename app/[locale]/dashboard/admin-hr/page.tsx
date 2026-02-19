import { getTranslations } from 'next-intl/server'

import { requireAdminHRWithOrg } from '@/src/shared/lib/auth'
import { OrganizationLimitsCard } from '@/src/widgets/organization-limits-card'
import { getDashboardStatsAction } from '@/src/features/admin-hr/api'
import { DashboardStatsCards } from '@/src/features/admin-hr/ui'

interface AdminHRDashboardPageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: AdminHRDashboardPageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'adminHR.dashboard' })

  return {
    title: `${t('title')} | VITA`,
    description: t('description'),
  }
}

export default async function AdminHRDashboardPage({ params }: AdminHRDashboardPageProps) {
  const { locale } = await params
  const [session, t, statsResult] = await Promise.all([
    requireAdminHRWithOrg(locale),
    getTranslations('adminHR.dashboard'),
    getDashboardStatsAction(),
  ])

  if (!statsResult.success || !statsResult.data)
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground mt-2">{t('description')}</p>
        </div>
        <p className="text-destructive">{statsResult.error || t('errorLoading')}</p>
      </div>
    )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground mt-2">{t('description')}</p>
      </div>

      <DashboardStatsCards stats={statsResult.data} />

      <div>
        <h2 className="text-xl font-semibold mb-4">{t('limitsTitle')}</h2>
        <OrganizationLimitsCard organizationId={session.organizationId} />
      </div>
    </div>
  )
}
