import { getTranslations } from 'next-intl/server'

import { requireDashboardUser, isAdminHR, isChiefArea, isStaffHealth } from '@/src/shared/lib/auth'
import { prisma } from '@/src/shared/lib/db'
import { getSectorsAction } from '@/src/features/sector/api'
import { SectorsTable } from '@/src/features/sector/ui'

interface SectorsPageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: SectorsPageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'adminHR.sectors' })

  return {
    title: `${t('title')} | VITA`,
    description: t('description'),
  }
}

export default async function SectorsPage({ params }: SectorsPageProps) {
  const { locale } = await params
  const [user, t] = await Promise.all([
    requireDashboardUser(locale),
    getTranslations('adminHR.sectors'),
  ])

  let organizationId: string | null = user.organizationId ?? null
  if ((isChiefArea(user) || isStaffHealth(user)) && !organizationId) {
    const firstArea = await prisma.userArea.findFirst({
      where: { userId: user.id },
      select: { area: { select: { organizationId: true } } },
    })
    organizationId = firstArea?.area?.organizationId ?? null
  }

  if (!organizationId)
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground mt-1">{t('description')}</p>
        </div>
        <div className="bg-destructive/10 text-destructive border-destructive/20 rounded-lg border p-4">
          {t('noOrganization')}
        </div>
      </div>
    )

  const result = await getSectorsAction()
  const sectors = (result.success && result.data ? result.data : []) as Array<{
    id: string
    name: string
    description: string | null
    icon: string | null
    color: string
    _count?: { sectorAreas: number }
    sectorAreas?: Array<{
      area: { id: string; name: string; icon: string | null; color: string }
    }>
  }>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground mt-1">{t('description')}</p>
      </div>

      <SectorsTable
        sectors={sectors}
        canCreate={isAdminHR(user)}
        canDelete={isAdminHR(user)}
        canEdit={!isStaffHealth(user)}
      />
    </div>
  )
}
