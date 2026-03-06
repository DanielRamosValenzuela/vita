import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'

import { isAdminHR, isChiefArea, requireAdminHROrChief } from '@/src/shared/lib/auth'
import { prisma } from '@/src/shared/lib/db'
import { getChiefsForSectorAction } from '@/src/features/sector/api'
import { SectorAreasCard, SectorBasicInfoCard, SectorChiefsCard } from '@/src/features/sector/ui'

import { getSectorById } from '@/src/entities/sector'

interface EditSectorPageProps {
  params: Promise<{ locale: string; id: string }>
}

export async function generateMetadata({ params }: EditSectorPageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'adminHR.sectors' })

  return {
    title: `${t('editTitle')} | VITA`,
    description: t('editDescription'),
  }
}

export default async function EditSectorPage({ params }: EditSectorPageProps) {
  const { locale, id } = await params
  const [user, t] = await Promise.all([
    requireAdminHROrChief(locale),
    getTranslations('adminHR.sectors'),
  ])

  let orgId: string | null = user.organizationId ?? null
  let isSectorChief = false

  if (isChiefArea(user)) {
    if (!orgId) {
      const firstArea = await prisma.userArea.findFirst({
        where: { userId: user.id },
        select: { area: { select: { organizationId: true } } },
      })
      orgId = firstArea?.area?.organizationId ?? null
    }

    const sectorChiefRecord = await prisma.userSector.findUnique({
      where: { userId_sectorId: { userId: user.id, sectorId: id } },
    })
    isSectorChief = !!sectorChiefRecord

    if (!isSectorChief) {
      const userAreas = await prisma.userArea.findMany({
        where: { userId: user.id },
        select: { areaId: true },
      })
      const userAreaIds = userAreas.map((ua) => ua.areaId)

      if (userAreaIds.length === 0) return notFound()

      const sectorHasUserArea = await prisma.sectorArea.findFirst({
        where: { sectorId: id, areaId: { in: userAreaIds } },
      })
      if (!sectorHasUserArea) return notFound()
    }
  }

  if (!orgId) return notFound()

  const userIsAdmin = isAdminHR(user)
  const canEditBasicInfo = userIsAdmin || isSectorChief

  const [sector, orgAreas] = await Promise.all([
    getSectorById(id, orgId),
    prisma.area.findMany({
      where: { organizationId: orgId },
      select: { id: true, name: true, icon: true, color: true },
      orderBy: { name: 'asc' },
    }),
  ])

  if (!sector) return notFound()

  const assignedAreas = sector.sectorAreas.map((sa) => sa.area)

  let chiefs: Array<{ id: string; name: string; email: string; docNumber: string | null }> = []
  let assignedChiefIds: string[] = []

  if (userIsAdmin) {
    const chiefsResult = await getChiefsForSectorAction(id)
    if (chiefsResult.success && chiefsResult.data) {
      const chiefsData = chiefsResult.data as {
        chiefs: typeof chiefs
        assignedChiefIds: string[]
      }
      chiefs = chiefsData.chiefs
      assignedChiefIds = chiefsData.assignedChiefIds
    }
  } else {
    const assignedChiefs = await prisma.userSector.findMany({
      where: { sectorId: id },
      include: { user: { select: { id: true, name: true, email: true, docNumber: true } } },
    })
    chiefs = assignedChiefs.map((uc) => uc.user)
    assignedChiefIds = assignedChiefs.map((uc) => uc.userId)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('editTitle')}</h1>
        <p className="text-muted-foreground mt-1">{t('editDescription')}</p>
      </div>

      <SectorBasicInfoCard sector={sector} canEdit={canEditBasicInfo} />
      <SectorAreasCard
        sectorId={sector.id}
        assignedAreas={assignedAreas}
        allAreas={orgAreas}
        canAssignAreas={userIsAdmin}
      />
      <SectorChiefsCard
        sectorId={sector.id}
        canAssignChiefs={userIsAdmin}
        chiefs={chiefs}
        assignedChiefIds={assignedChiefIds}
      />
    </div>
  )
}
