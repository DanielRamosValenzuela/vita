import { notFound } from 'next/navigation'

import { getTranslations } from 'next-intl/server'
import { Role } from '@prisma/client'

import { prisma } from '@/src/shared/lib/db'
import { requireAdminHROrChiefArea } from '@/src/shared/lib/auth'
import { getAreaById } from '@/src/entities/area'
import { getChiefsForAreaAction } from '@/src/features/admin-hr/api'
import { AreaEditForm } from '@/src/features/admin-hr/ui'
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

  if (!user.organizationId)
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('editTitle')}</h1>
          <p className="text-muted-foreground mt-2">{t('noOrganization')}</p>
        </div>
      </div>
    )

  const [area, shiftTypesResult, chiefAreaCheck, chiefsResult] = await Promise.all([
    getAreaById(id, user.organizationId),
    getShiftTypesAction(),
    user.role === Role.CHIEF_AREA
      ? prisma.userArea.findFirst({ where: { userId: user.id, areaId: id } })
      : Promise.resolve(true),
    user.role === Role.ADMIN_HR ? getChiefsForAreaAction(id) : Promise.resolve(null),
  ])

  if (!area)
    notFound()

  if (user.role === Role.CHIEF_AREA && !chiefAreaCheck)
    notFound()

  const allShiftTypes = shiftTypesResult.success && shiftTypesResult.data ? shiftTypesResult.data : []
  const areaShiftTypeIds = new Set(area.shiftTypes.map((ast) => ast.shiftType.id))
  const shiftTypes = allShiftTypes.filter(
    (st) => st.isGlobal || areaShiftTypeIds.has(st.id)
  ).map((st) => ({
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
        canAssignChiefs={user.role === Role.ADMIN_HR}
        chiefs={chiefs}
        initialAssignedChiefIds={assignedChiefIds}
      />
    </div>
  )
}
