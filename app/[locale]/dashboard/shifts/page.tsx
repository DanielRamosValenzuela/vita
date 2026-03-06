import { getTranslations } from 'next-intl/server'
import { endOfMonth, startOfMonth } from 'date-fns'

import { resolveChiefOrganizationId } from '@/src/shared/lib/auth/chief-access'
import { isChiefArea } from '@/src/shared/lib/auth/rbac'
import { requireAdminHROrChief } from '@/src/shared/lib/auth/session'
import { getAreasAction } from '@/src/features/area/api'
import {
  getShiftsAction,
  getShiftTypesAction,
  getUsersForShiftsAction,
} from '@/src/features/shifts/api'
import { ShiftsPageContent } from '@/src/features/shifts/ui'

interface ShiftsPageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: ShiftsPageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'shifts' })

  return {
    title: `${t('title')} | VITA`,
    description: t('description'),
  }
}

export default async function ShiftsPage({ params }: ShiftsPageProps) {
  const { locale } = await params
  const [session, t] = await Promise.all([requireAdminHROrChief(locale), getTranslations('shifts')])

  const organizationId = isChiefArea(session)
    ? await resolveChiefOrganizationId(session.id, session.organizationId ?? null)
    : (session.organizationId ?? null)

  if (!organizationId)
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground mt-2">{t('noOrganization')}</p>
        </div>
      </div>
    )

  const now = new Date()
  const [shiftTypesResult, usersResult, areasResult, shiftsResult] = await Promise.all([
    getShiftTypesAction(),
    getUsersForShiftsAction(),
    getAreasAction(),
    getShiftsAction({
      startDate: startOfMonth(now),
      endDate: endOfMonth(now),
      pageSize: 200,
    }),
  ])

  if (
    !shiftTypesResult.success ||
    !usersResult.success ||
    !areasResult.success ||
    !shiftsResult.success
  )
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground mt-2">{t('loadError')}</p>
        </div>
      </div>
    )

  const shiftTypes = shiftTypesResult.data || []
  const users = usersResult.data || []
  const areasRaw = Array.isArray(areasResult.data) ? areasResult.data : []
  const areas = areasRaw.map(
    (area: {
      id: string
      name: string
      description?: string | null
      color?: string | null
      icon?: string | null
    }) => ({
      id: area.id,
      name: area.name,
      description: area.description || undefined,
      color: area.color || undefined,
      icon: area.icon || undefined,
    })
  )

  const shifts = shiftsResult.data?.shifts || []

  return (
    <ShiftsPageContent
      organizationId={organizationId}
      initialShifts={shifts}
      users={users}
      areas={areas}
      shiftTypes={shiftTypes}
    />
  )
}
