import { getTranslations } from 'next-intl/server'

import { getContractsPageDataAction } from '@/src/features/admin-hr/api'
import { ContractsPage } from '@/src/features/admin-hr/ui'
import { requireAdminHRWithOrg } from '@/src/shared/lib/auth/session'
import { prisma } from '@/src/shared/lib/db'

interface RatesRouteProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: RatesRouteProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'adminHR.rates' })

  return {
    title: `${t('title')} | VITA`,
    description: t('description'),
  }
}

export default async function RatesRoute({ params }: RatesRouteProps) {
  const { locale } = await params
  const session = await requireAdminHRWithOrg(locale)
  const t = await getTranslations('adminHR.rates')

  const organization = await prisma.organization.findUnique({
    where: { id: session.organizationId },
    select: { currency: true },
  })

  if (!organization)
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground mt-2">{t('noOrganization')}</p>
        </div>
      </div>
    )

  const result = await getContractsPageDataAction()

  if (!result.success || !result.data)
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground mt-2">{t('loadError')}</p>
        </div>
      </div>
    )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground mt-2">{t('description')}</p>
      </div>

      <ContractsPage data={result.data} currency={organization.currency} />
    </div>
  )
}
