import { getTranslations } from 'next-intl/server'
import { ShiftStatus } from '@prisma/client'
import { endOfMonth, format, startOfMonth } from 'date-fns'

import { requireAdminHR } from '@/src/shared/lib/auth/session'
import { Badge } from '@/src/shared/ui/badge'
import { Button } from '@/src/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/shared/ui/table'
import { getAreasAction } from '@/src/features/admin-hr/api/area-actions'
import { getShiftsAction } from '@/src/features/shifts/api/shift-actions'
import { getShiftTypesAction } from '@/src/features/shifts/api/shift-type-actions'
import { getUsersForShiftsAction } from '@/src/features/shifts/api/user-actions'
import { ShiftCalendar } from '@/src/features/shifts/ui/shift-calendar'
import { ShiftFilters } from '@/src/features/shifts/ui/shift-filters'
import { ShiftFormDialog } from '@/src/features/shifts/ui/shift-form-dialog'

interface Shift {
  id: string
  title: string | null
  startTime: Date
  endTime: Date
  status: ShiftStatus
  notes: string | null
  user: {
    id: string
    name: string
    email: string
    role: string
  }
  area: {
    id: string
    name: string
  }
  shiftType: {
    id: string
    name: string
    color: string
    icon?: string | null
  }
}

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
  const session = await requireAdminHR(locale)
  const t = await getTranslations('shifts')

  if (!session.organizationId)
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground mt-2">{t('noOrganization')}</p>
        </div>
      </div>
    )

  const [shiftTypesResult, usersResult, areasResult] = await Promise.all([
    getShiftTypesAction(),
    getUsersForShiftsAction(),
    getAreasAction(),
  ])

  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)
  const shiftsResult = await getShiftsAction({
    startDate: monthStart,
    endDate: monthEnd,
  })

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
  const areas = areasRaw.map((area: { id: string; name: string; description?: string | null }) => ({
    id: area.id,
    name: area.name,
    description: area.description || undefined,
  }))

  const shifts = shiftsResult.data?.shifts || []

  const calendarShifts = (shifts || []).map((shift: Shift) => ({
    id: shift.id,
    title: shift.title || 'Sin título',
    startTime: shift.startTime,
    endTime: shift.endTime,
    status: shift.status,
    userName: shift.user.name,
    areaName: shift.area.name,
    color: shift.shiftType.color,
    icon: shift.shiftType.icon ?? 'Clock',
  }))

  const getStatusColor = (status: ShiftStatus) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-green-100 text-green-800 hover:bg-green-200'
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200'
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 hover:bg-red-200'
      case 'NO_SHOW':
        return 'bg-orange-100 text-orange-800 hover:bg-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200'
    }
  }

  const getStatusLabel = (status: ShiftStatus) => {
    switch (status) {
      case 'SCHEDULED':
        return t('status.scheduled')
      case 'IN_PROGRESS':
        return t('status.inProgress')
      case 'COMPLETED':
        return t('status.completed')
      case 'CANCELLED':
        return t('status.cancelled')
      case 'NO_SHOW':
        return t('status.noShow')
      default:
        return status
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground mt-2">{t('description')}</p>
        </div>

        <ShiftFormDialog
          organizationId={session.organizationId!}
          users={users}
          areas={areas}
          shiftTypes={shiftTypes}
        />
      </div>

      {}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.totalShifts')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shifts.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.thisMonth')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {shifts.filter((s: Shift) => s.status === 'SCHEDULED').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.inProgress')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {shifts.filter((s: Shift) => s.status === 'IN_PROGRESS').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.completed')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {shifts.filter((s: Shift) => s.status === 'COMPLETED').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {}
      <Card>
        <CardHeader>
          <CardTitle>{t('filters.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ShiftFilters
            users={users}
            areas={areas}
            shiftTypes={shiftTypes}
            onFiltersChange={() => {}}
          />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {}
        <Card>
          <CardHeader>
            <CardTitle>{t('calendar.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ShiftCalendar
              shifts={calendarShifts}
              onDateSelect={(_date) => {}}
              onShiftClick={(_shift) => {}}
            />
          </CardContent>
        </Card>

        {}
        <Card>
          <CardHeader>
            <CardTitle>{t('recent.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            {shifts.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">{t('recent.noShifts')}</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('table.user')}</TableHead>
                    <TableHead>{t('table.title')}</TableHead>
                    <TableHead>{t('table.role')}</TableHead>
                    <TableHead>{t('table.time')}</TableHead>
                    <TableHead>{t('table.status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(shifts || []).slice(0, 10).map((shift: Shift) => (
                    <TableRow key={shift.id}>
                      <TableCell className="font-medium">{shift.user.name}</TableCell>
                      <TableCell>{shift.title || 'Sin título'}</TableCell>
                      <TableCell>{shift.user.role || 'N/A'}</TableCell>
                      <TableCell>
                        {format(shift.startTime, 'HH:mm')} - {format(shift.endTime, 'HH:mm')}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(shift.status)}>
                          {getStatusLabel(shift.status)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {shifts.length > 10 && (
              <div className="mt-4 text-center">
                <Button variant="outline">{t('recent.viewAll')}</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
