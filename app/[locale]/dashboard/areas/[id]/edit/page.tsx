import { notFound } from 'next/navigation'

import { getTranslations } from 'next-intl/server'

import type { ShiftType } from '@prisma/client'

import { prisma } from '@/src/shared/lib/db'
import { requireAdminHROrChiefArea } from '@/src/shared/lib/auth'
import { isChiefArea } from '@/src/shared/lib/auth/rbac'
import { getAreaById, type AreaShiftTypeItem } from '@/src/entities/area'
import { getChiefsForAreaAction } from '@/src/features/area/api'
import { AreaEditForm } from '@/src/features/area/ui'
import { getShiftTypesAction } from '@/src/features/shifts/api'

interface AreaEditPageProps {
  params: Promise<{ locale: string; id: string }>
}

export async function generateMetadata({ params }: AreaEditPageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'adminHR.areas' })

  return {
    title: `${t('editTitle')} | VITA`,
    description: t('editDescription'),
  }
}

export default async function AreaEditPage({ params }: AreaEditPageProps) {
  const { locale, id } = await params
  const user = await requireAdminHROrChiefArea(locale)
  const t = await getTranslations('adminHR.areas')

  let organizationId: string | null = user.organizationId ?? null
  if (isChiefArea(user) && !organizationId) {
    const firstArea = await prisma.userArea.findFirst({
      where: { userId: user.id },
      select: { area: { select: { organizationId: true } } },
    })
    organizationId = (firstArea?.area?.organizationId ?? null) as string | null
  }

  if (!organizationId)
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('editTitle')}</h1>
          <p className="text-muted-foreground mt-2">{t('noOrganization')}</p>
        </div>
      </div>
    )

  const effectiveOrgId = organizationId

  const [area, shiftTypesResult, chiefAreaCheck, chiefsResult] = await Promise.all([
    getAreaById(id, effectiveOrgId),
    getShiftTypesAction(),
    isChiefArea(user)
      ? prisma.userArea.findFirst({ where: { userId: user.id, areaId: id } })
      : Promise.resolve(true),
    !isChiefArea(user) ? getChiefsForAreaAction(id) : Promise.resolve(null),
  ])

  if (!area)
    notFound()

  if (isChiefArea(user) && !chiefAreaCheck)
    notFound()

  const allShiftTypes: ShiftType[] =
    shiftTypesResult.success && shiftTypesResult.data ? shiftTypesResult.data : []
  const areaShiftTypeIds = new Set(
    area.shiftTypes.map((ast: AreaShiftTypeItem) => ast.shiftType.id)
  )
  const shiftTypes = allShiftTypes
    .filter((st) => st.isGlobal || areaShiftTypeIds.has(st.id))
    .map((st) => ({
      id: st.id,
      name: st.name,
      durationMinutes: st.durationMinutes,
      classification: st.classification,
      color: st.color,
      icon: st.icon ?? undefined,
    }))

  type ChiefsData = {
    chiefs: Array<{ id: string; name: string; email: string; docNumber: string | null }>
    assignedChiefIds: string[]
  }
  const chiefsPayload =
    chiefsResult && chiefsResult.success && chiefsResult.data
      ? (chiefsResult.data as ChiefsData)
      : null
  const chiefs = chiefsPayload?.chiefs ?? []
  const assignedChiefIds = chiefsPayload?.assignedChiefIds
    ? new Set(chiefsPayload.assignedChiefIds)
    : new Set<string>()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('editTitle')}</h1>
        <p className="text-muted-foreground mt-2">{t('editDescription')}</p>
      </div>

      <AreaEditForm
        area={area}
        shiftTypes={shiftTypes}
        canAssignChiefs={!isChiefArea(user)}
        chiefs={chiefs}
        initialAssignedChiefIds={assignedChiefIds}
      />
    </div>
  )
}
