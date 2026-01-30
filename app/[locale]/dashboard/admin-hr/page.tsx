import { getTranslations } from 'next-intl/server'

import { requireAdminHR } from '@/src/shared/lib/auth'
import type { AdminHRDashboardStats } from '@/src/features/admin-hr/lib'
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
  await requireAdminHR(locale)
  const t = await getTranslations('adminHR.dashboard')

  const stats: AdminHRDashboardStats = {
    totalAreas: 0,
    totalShiftTypes: 0,
    totalStaff: 0,
    totalContracts: 0,
    activeShifts: 0,
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground mt-2">{t('description')}</p>
      </div>

      <DashboardStatsCards stats={stats} />
    </div>
  )
}
