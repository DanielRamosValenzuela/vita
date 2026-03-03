import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Role } from '@prisma/client'

import { requireDashboardUser } from '@/src/shared/lib/auth/session'
import { prisma } from '@/src/shared/lib/db'
import { getPayrollPeriodsAction } from '@/src/features/payroll/api/payroll-history-actions'
import { PayrollPage } from '@/src/features/payroll/ui/payroll-page'
import { PayrollGeneration } from '@/src/features/admin-hr/ui/payroll-generation'

interface PayrollRouteProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: PayrollRouteProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'payroll' })

  return {
    title: `${t('title')} | VITA`,
    description: t('title'),
  }
}

export default async function PayrollRoute({ params }: PayrollRouteProps) {
  const { locale } = await params
  const session = await requireDashboardUser(locale)

  if (!session.organizationId) 
    redirect(`/${locale}/dashboard`)
  

  const organization = await prisma.organization.findUnique({
    where: { id: session.organizationId },
    select: { currency: true },
  })

  if (!organization) 
    redirect(`/${locale}/dashboard`)
  

  const currentYear = new Date().getFullYear()
  const periodsResult = await getPayrollPeriodsAction({ year: currentYear })
  const initialPeriods = periodsResult.success ? (periodsResult.data ?? []) : []

  const isAdmin = session.role === Role.ADMIN_HR

  const t = await getTranslations('payroll')

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground mt-2">{t('description')}</p>
      </div>

      {isAdmin && <PayrollGeneration />}

      <PayrollPage
        role={session.role}
        initialPeriods={initialPeriods}
        currency={organization.currency}
      />
    </div>
  )
}
