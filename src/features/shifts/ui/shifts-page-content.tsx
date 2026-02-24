'use client'

import { useMemo, useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import type { ShiftStatus } from '@prisma/client'
import { endOfMonth, format, startOfMonth } from 'date-fns'
import { CalendarDays, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/src/shared/ui/alert-dialog'
import { Badge } from '@/src/shared/ui/badge'
import { Button } from '@/src/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/ui/card'
import { Skeleton } from '@/src/shared/ui/skeleton'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/src/shared/ui/tooltip'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/shared/ui/table'

import { useRouter } from '@/i18n/navigation'

import { deleteShiftAction, getShiftsAction } from '../api/shift-actions'
import { groupShiftsForCalendar } from '../lib/calendar-grouping'
import type { ShiftWithRelations } from '../types/shift-types'
import { AreaSwitcher } from './area-switcher'
import { RotationShiftsDetailDialog } from './rotation-shifts-detail-dialog'
import type { RotationGroupCalendarEvent } from './shift-calendar'
import { ShiftCalendar } from './shift-calendar'
import { ShiftFilters } from './shift-filters'
import type { ShiftTypeOption } from './shift-form'
import { ShiftFormDialog } from './shift-form-dialog'

interface AreaOption {
  id: string
  name: string
  description?: string
  color?: string
  icon?: string
}

interface UserOption {
  id: string
  name: string
  role: string
  areaIds?: string[]
}

interface ShiftsPageContentProps {
  organizationId: string
  initialShifts: ShiftWithRelations[]
  users: UserOption[]
  areas: AreaOption[]
  shiftTypes: ShiftTypeOption[]
}

export function ShiftsPageContent({
  organizationId,
  initialShifts,
  users,
  areas,
  shiftTypes,
}: ShiftsPageContentProps) {
  const t = useTranslations('shifts')
  const tToast = useTranslations()
  const router = useRouter()
  const [shifts, setShifts] = useState<ShiftWithRelations[]>(() => initialShifts)
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingShift, setEditingShift] = useState<ShiftWithRelations | null>(null)
  const [shiftToDelete, setShiftToDelete] = useState<ShiftWithRelations | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [rotationDetailOpen, setRotationDetailOpen] = useState(false)
  const [rotationDetailShifts, setRotationDetailShifts] = useState<ShiftWithRelations[]>([])
  const [rotationDetailMeta, setRotationDetailMeta] = useState<{ shiftTypeName: string; date: string }>({ shiftTypeName: '', date: '' })

  const calendarShifts = useMemo(
    () => groupShiftsForCalendar(shifts, t('table.noTitle')),
    [shifts, t]
  )

  const filteredAreas = useMemo(
    () =>
      areas.map((area) => ({
        id: area.id,
        name: area.name,
        color: area.color,
        icon: area.icon,
      })),
    [areas]
  )

  const formAreas = useMemo(
    () =>
      areas.map((area) => ({
        id: area.id,
        name: area.name,
        description: area.description,
      })),
    [areas]
  )

  const formUsers = useMemo(
    () =>
      users.map((u) => ({
        id: u.id,
        name: u.name,
        role: u.role,
        areaIds: u.areaIds,
      })),
    [users]
  )

  const [currentFilters, setCurrentFilters] = useState<{
    status?: string
    userId?: string
    shiftTypeId?: string
    search?: string
    startDate?: Date
    endDate?: Date
  }>({})
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const fetchShifts = (params: {
    areaId?: string | null
    status?: string
    userId?: string
    shiftTypeId?: string
    search?: string
    startDate?: Date
    endDate?: Date
    monthDate?: Date
  }) => {
    const monthDate = params.monthDate ?? currentMonth
    const start = params.startDate ?? startOfMonth(monthDate)
    const end = params.endDate ?? endOfMonth(monthDate)

    startTransition(async () => {
      const result = await getShiftsAction({
        startDate: start,
        endDate: end,
        areaId: (params.areaId !== undefined ? params.areaId : selectedAreaId) || undefined,
        status: (params.status || undefined) as import('@prisma/client').ShiftStatus | undefined,
        userId: params.userId || undefined,
        shiftTypeId: params.shiftTypeId || undefined,
        search: params.search || undefined,
        pageSize: 200,
      })
      if (result.success && result.data) setShifts(result.data.shifts)
    })
  }

  const handleAreaChange = (areaId: string | null) => {
    setSelectedAreaId(areaId)
    fetchShifts({ areaId, ...currentFilters })
  }

  const handleFiltersChange = (filters: {
    search: string
    status: string
    userId: string
    areaId: string
    shiftTypeId: string
    startDate?: Date
    endDate?: Date
  }) => {
    const newFilters = {
      status: filters.status || undefined,
      userId: filters.userId || undefined,
      shiftTypeId: filters.shiftTypeId || undefined,
      search: filters.search || undefined,
      startDate: filters.startDate,
      endDate: filters.endDate,
    }
    setCurrentFilters(newFilters)
    fetchShifts({ ...newFilters })
  }

  const handleMonthChange = (month: Date) => {
    setCurrentMonth(month)
    fetchShifts({ monthDate: month, ...currentFilters })
  }

  const handleShiftClick = (calendarEvent: { id: string }) => {
    const fullShift = shifts.find((s) => s.id === calendarEvent.id)
    if (fullShift) {
      setEditingShift(fullShift)
      setDialogOpen(true)
    }
  }

  const handleShiftDeleteClick = (calendarEvent: { id: string }) => {
    const fullShift = shifts.find((s) => s.id === calendarEvent.id)
    if (fullShift) setShiftToDelete(fullShift)
  }

  const handleRotationBlockClick = (block: RotationGroupCalendarEvent) => {
    const blockShifts = shifts.filter((s) => block.shiftIds.includes(s.id))
    setRotationDetailShifts(blockShifts)
    setRotationDetailMeta({
      shiftTypeName: block.title,
      date: format(block.startTime, 'dd/MM/yyyy'),
    })
    setRotationDetailOpen(true)
  }

  const handleEditShiftFromRotationDetail = (shift: ShiftWithRelations) => {
    setRotationDetailOpen(false)
    setEditingShift(shift)
    setDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!shiftToDelete) return
    setIsDeleting(true)
    try {
      const result = await deleteShiftAction(shiftToDelete.id)
      if (result.success) {
        toast.success(tToast('toast.shifts.deleted'))
        setShiftToDelete(null)
        router.refresh()
        fetchShifts({ ...currentFilters })
      } else
        toast.error(result.error || tToast('toast.shifts.errorDeleting'))

    } catch {
      toast.error(tToast('toast.shifts.errorDeleting'))
    } finally {
      setIsDeleting(false)
    }
  }

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

        <Button
          type="button"
          onClick={() => {
            setEditingShift(null)
            setDialogOpen(true)
          }}
        >
          <CalendarDays className="mr-2 h-4 w-4" />
          {t('newShift')}
        </Button>
        <ShiftFormDialog
          organizationId={organizationId}
          users={formUsers}
          areas={formAreas}
          shiftTypes={shiftTypes}
          initialAreaId={selectedAreaId}
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open)
            if (!open) setEditingShift(null)
          }}
          editingShift={editingShift}
          onSuccess={() => fetchShifts({ ...currentFilters })}
        />
        <AlertDialog
          open={!!shiftToDelete}
          onOpenChange={(open) => !open && setShiftToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('deleteConfirm.title')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('deleteConfirm.description')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>
                {t('form.cancel')}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? t('form.saving') : t('deleteConfirm.action')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <AreaSwitcher
        areas={filteredAreas}
        selectedAreaId={selectedAreaId}
        onAreaChange={handleAreaChange}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.totalShifts')}</CardTitle>
          </CardHeader>
          <CardContent>
            {isPending
              ? <Skeleton className="h-8 w-12" />
              : <div className="text-2xl font-bold">{shifts.length}</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.thisMonth')}</CardTitle>
          </CardHeader>
          <CardContent>
            {isPending
              ? <Skeleton className="h-8 w-12" />
              : (
                <div className="text-2xl font-bold">
                  {shifts.filter((s) => {
                    const shiftDate = new Date(s.startTime)
                    const now = new Date()
                    return (
                      shiftDate.getMonth() === now.getMonth() &&
                      shiftDate.getFullYear() === now.getFullYear()
                    )
                  }).length}
                </div>
              )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.inProgress')}</CardTitle>
          </CardHeader>
          <CardContent>
            {isPending
              ? <Skeleton className="h-8 w-12" />
              : (
                <div className="text-2xl font-bold">
                  {shifts.filter((s) => s.status === 'IN_PROGRESS').length}
                </div>
              )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <ShiftFilters
            users={formUsers}
            areas={formAreas}
            shiftTypes={shiftTypes}
            selectedAreaId={selectedAreaId}
            onFiltersChange={handleFiltersChange}
          />
        </CardContent>
      </Card>

      <div className="space-y-6">
        <ShiftCalendar
          shifts={calendarShifts}
          loading={isPending}
          onMonthChange={handleMonthChange}
          onShiftClick={handleShiftClick}
          onShiftDelete={handleShiftDeleteClick}
          onRotationBlockClick={handleRotationBlockClick}
        />

        <RotationShiftsDetailDialog
          open={rotationDetailOpen}
          onOpenChange={setRotationDetailOpen}
          shifts={rotationDetailShifts}
          shiftTypeName={rotationDetailMeta.shiftTypeName}
          date={rotationDetailMeta.date}
          onEditShift={handleEditShiftFromRotationDetail}
          getStatusColor={(status) => getStatusColor(status as ShiftStatus)}
          getStatusLabel={(status) => getStatusLabel(status as ShiftStatus)}
        />

        <Card>
          <CardHeader>
            <CardTitle>{t('recent.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            {isPending ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }, (_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                ))}
              </div>
            ) : shifts.length === 0 ? (
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
                  {shifts.slice(0, 10).map((shift) => (
                    <TableRow key={shift.id}>
                      <TableCell className="font-medium">{shift.user.name}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1">
                          {shift.title || shift.rotation?.name || t('table.noTitle')}
                          {shift.rotationId && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <RefreshCw
                                  className="h-3 w-3 text-blue-500 shrink-0"
                                  aria-label={t('table.rotationGenerated')}
                                />
                              </TooltipTrigger>
                              <TooltipContent>{t('table.rotationGenerated')}</TooltipContent>
                            </Tooltip>
                          )}
                        </span>
                      </TableCell>
                      <TableCell>{shift.user.role || t('table.noRole')}</TableCell>
                      <TableCell>
                        {t('table.timeRange', {
                          start: format(shift.startTime, 'HH:mm'),
                          end: format(shift.endTime, 'HH:mm'),
                        })}
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

            {!isPending && shifts.length > 10 && (
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
