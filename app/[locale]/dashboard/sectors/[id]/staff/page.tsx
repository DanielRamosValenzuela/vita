import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

import { requireDashboardUser, isChiefArea, isStaff } from '@/src/shared/lib/auth'
import { prisma } from '@/src/shared/lib/db'
import { getSectorById } from '@/src/entities/sector'
import { SectorStaffQuery } from '@/src/features/sector/ui'

interface StaffPageProps {
  params: Promise<{ locale: string; id: string }>
}

export async function generateMetadata({ params }: StaffPageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'adminHR.sectors' })

  return {
    title: `${t('staffQuery.title')} | VITA`,
    description: t('staffQuery.description'),
  }
}

export default async function SectorStaffPage({ params }: StaffPageProps) {
  const { locale, id } = await params
  const [user, t] = await Promise.all([
    requireDashboardUser(locale),
    getTranslations('adminHR.sectors'),
  ])

  let orgId: string | null = user.organizationId ?? null
  if ((isChiefArea(user) || isStaff(user)) && !orgId) {
    const firstArea = await prisma.userArea.findFirst({
      where: { userId: user.id },
      select: { area: { select: { organizationId: true } } },
    })
    orgId = firstArea?.area?.organizationId ?? null
  }

  if (!orgId) return notFound()

  const sector = await getSectorById(id, orgId)
  if (!sector) return notFound()

  if (isChiefArea(user) || isStaff(user)) {
    const userAreas = await prisma.userArea.findMany({
      where: { userId: user.id },
      select: { areaId: true },
    })
    const userAreaIds = new Set(userAreas.map((ua) => ua.areaId))
    const hasSectorAccess = sector.sectorAreas.some((sa) => userAreaIds.has(sa.area.id))
    if (!hasSectorAccess) return notFound()
  }

  const pageTitle = `${t('staffQuery.title')} \u2014 ${sector.name}`

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {pageTitle}
        </h1>
        <p className="text-muted-foreground mt-1">{t('staffQuery.description')}</p>
      </div>

      <SectorStaffQuery sectorId={sector.id} />
    </div>
  )
}
