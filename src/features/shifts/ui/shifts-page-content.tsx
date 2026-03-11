'use client'

import { useMemo, useReducer, useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import type { ShiftStatus } from '@prisma/client'
import { endOfMonth, format, startOfMonth } from 'date-fns'
import { CalendarDays, RefreshCw, Star } from 'lucide-react'
import { toast } from 'sonner'

import {
  SHIFT_STATUS_COLORS_HOVER,
  SHIFT_STATUS_I18N_KEYS,
} from '@/src/shared/lib/constants/shift-status'
import { useClientPagination } from '@/src/shared/lib/hooks/use-client-pagination'
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
import { DataTablePagination } from '@/src/shared/ui/molecules/data-table-pagination'
import { Skeleton } from '@/src/shared/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/shared/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/src/shared/ui/tooltip'

import { useRouter } from '@/i18n/navigation'
import { groupShiftsForCalendar } from '@/src/entities/shift/lib/calendar-grouping'
import type { ShiftWithRelations } from '@/src/entities/shift/types/shift-types'
import {
  ShiftCalendar,
  type RotationGroupCalendarEvent,
} from '@/src/entities/shift/ui/shift-calendar'

import { deleteShiftAction, getShiftsAction } from '../api/shift-actions'
import { AreaSwitcher } from './area-switcher'
import { RotationShiftsDetailDialog } from './rotation-shifts-detail-dialog'
import { ShiftCompletionDialog } from './shift-completion-dialog'
import { ShiftDetailSheet } from './shift-detail-sheet'
import { ShiftFilters } from './shift-filters'
import type { ShiftTypeOption } from './shift-form'
import { ShiftFormDialog } from './shift-form-dialog'


type PageState = {
  dialogOpen: boolean
  editingShift: ShiftWithRelations | null
  detailShift: ShiftWithRelations | null
  detailOpen: boolean
  shiftToDelete: ShiftWithRelations | null
  isDeleting: boolean
  rotationDetail: {
    open: boolean
    shifts: ShiftWithRelations[]
    meta: { shiftTypeName: string; date: string }
  }
  currentFilters: {
    status?: string
    userId?: string
    shiftTypeId?: string
    search?: string
    startDate?: Date
    endDate?: Date
  }
  currentMonth: Date
  completionDialog: { open: boolean; date: Date | null }
}

type PageAction =
  | { type: 'OPEN_CREATE_DIALOG' }
  | { type: 'OPEN_EDIT_DIALOG'; payload: ShiftWithRelations }
  | { type: 'CLOSE_DIALOG' }
  | { type: 'OPEN_DETAIL'; payload: ShiftWithRelations }
  | { type: 'CLOSE_DETAIL' }
  | { type: 'SET_DELETE_TARGET'; payload: ShiftWithRelations }
  | { type: 'CLEAR_DELETE_TARGET' }
  | { type: 'SET_DELETING'; payload: boolean }
  | {
      type: 'OPEN_ROTATION_DETAIL'
      payload: { shifts: ShiftWithRelations[]; meta: { shiftTypeName: string; date: string } }
    }
  | { type: 'CLOSE_ROTATION_DETAIL' }
  | { type: 'SET_FILTERS'; payload: PageState['currentFilters'] }
  | { type: 'SET_MONTH'; payload: Date }
  | { type: 'OPEN_COMPLETION'; payload: Date }
  | { type: 'CLOSE_COMPLETION' }

const initialPageState: PageState = {
  dialogOpen: false,
  editingShift: null,
  detailShift: null,
  detailOpen: false,
  shiftToDelete: null,
  isDeleting: false,
  rotationDetail: {
    open: false,
    shifts: [],
    meta: { shiftTypeName: '', date: '' },
  },
  currentFilters: {},
  currentMonth: new Date(),
  completionDialog: { open: false, date: null },
}

function pageReducer(state: PageState, action: PageAction): PageState {
  switch (action.type) {
    case 'OPEN_CREATE_DIALOG':
      return { ...state, dialogOpen: true, editingShift: null }
    case 'OPEN_EDIT_DIALOG':
      return { ...state, dialogOpen: true, editingShift: action.payload }
    case 'CLOSE_DIALOG':
      return { ...state, dialogOpen: false, editingShift: null }
    case 'OPEN_DETAIL':
      return { ...state, detailOpen: true, detailShift: action.payload }
    case 'CLOSE_DETAIL':
      return { ...state, detailOpen: false }
    case 'SET_DELETE_TARGET':
      return { ...state, shiftToDelete: action.payload }
    case 'CLEAR_DELETE_TARGET':
      return { ...state, shiftToDelete: null }
    case 'SET_DELETING':
      return { ...state, isDeleting: action.payload }
    case 'OPEN_ROTATION_DETAIL':
      return {
        ...state,
        rotationDetail: { open: true, shifts: action.payload.shifts, meta: action.payload.meta },
      }
    case 'CLOSE_ROTATION_DETAIL':
      return { ...state, rotationDetail: { ...state.rotationDetail, open: false } }
    case 'SET_FILTERS':
      return { ...state, currentFilters: action.payload }
    case 'SET_MONTH':
      return { ...state, currentMonth: action.payload }
    case 'OPEN_COMPLETION':
      return { ...state, completionDialog: { open: true, date: action.payload } }
    case 'CLOSE_COMPLETION':
      return { ...state, completionDialog: { open: false, date: null } }
    default:
      return state
  }
}

function ShiftStatsCards({
  shifts,
  totalCount,
  isPending,
  t,
}: {
  shifts: ShiftWithRelations[]
  totalCount: number
  isPending: boolean
  t: ReturnType<typeof useTranslations<'shifts'>>
}) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('stats.totalShifts')}</CardTitle>
        </CardHeader>
        <CardContent>
          {isPending ? (
            <Skeleton className="h-8 w-12" />
          ) : (
            <div className="text-2xl font-bold">{totalCount}</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('stats.thisMonth')}</CardTitle>
        </CardHeader>
        <CardContent>
          {isPending ? (
            <Skeleton className="h-8 w-12" />
          ) : (
            <div className="text-2xl font-bold">
              {
                shifts.filter((s) => {
                  const shiftDate = new Date(s.startTime)
                  const now = new Date()
                  return (
                    shiftDate.getMonth() === now.getMonth() &&
                    shiftDate.getFullYear() === now.getFullYear()
                  )
                }).length
              }
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('stats.inProgress')}</CardTitle>
        </CardHeader>
        <CardContent>
          {isPending ? (
            <Skeleton className="h-8 w-12" />
          ) : (
            <div className="text-2xl font-bold">
              {shifts.filter((s) => s.status === 'IN_PROGRESS').length}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function ShiftsTableSection({
  shifts,
  isPending,
  t,
  onShiftClick,
}: {
  shifts: ShiftWithRelations[]
  isPending: boolean
  t: ReturnType<typeof useTranslations<'shifts'>>
  onShiftClick?: (shift: ShiftWithRelations) => void
}) {
  const { paginatedItems, page, totalPages, setPage } = useClientPagination({
    items: shifts,
    pageSize: 10,
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('recent.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        {isPending ? (
          <div className="space-y-3">
            {['a', 'b', 'c', 'd', 'e'].map((skId) => (
              <div key={`table-sk-${skId}`} className="flex items-center gap-4">
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
          <>
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
                {paginatedItems.map((shift) => (
                  <TableRow
                    key={shift.id}
                    className={onShiftClick ? 'cursor-pointer hover:bg-muted/50' : ''}
                    onClick={() => onShiftClick?.(shift)}
                  >
                    <TableCell className="font-medium">
                      <span className="inline-flex items-center gap-1.5">
                        {shift.user.name}
                        {shift.isExtra && (
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1 py-0 border-amber-400 text-amber-600"
                          >
                            <Star className="h-2.5 w-2.5 mr-0.5 fill-amber-500 text-amber-500" />
                            {t('extraBadge')}
                          </Badge>
                        )}
                      </span>
                    </TableCell>
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
                      <Badge className={SHIFT_STATUS_COLORS_HOVER[shift.status]}>
                        {t(SHIFT_STATUS_I18N_KEYS[shift.status])}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <DataTablePagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </CardContent>
    </Card>
  )
}

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
  const [totalCount, setTotalCount] = useState<number>(initialShifts.length)
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [state, dispatch] = useReducer(pageReducer, initialPageState)

  const {
    dialogOpen,
    editingShift,
    detailShift,
    detailOpen,
    shiftToDelete,
    isDeleting,
    rotationDetail,
    currentFilters,
    currentMonth,
    completionDialog,
  } = state

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
      if (result.success && result.data) {
        setShifts(result.data.shifts)
        setTotalCount(result.data.total)
      }
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
    dispatch({ type: 'SET_FILTERS', payload: newFilters })
    fetchShifts({ ...newFilters })
  }

  const handleMonthChange = (month: Date) => {
    dispatch({ type: 'SET_MONTH', payload: month })
    fetchShifts({ monthDate: month, ...currentFilters })
  }

  const handleShiftClick = (calendarEvent: { id: string }) => {
    const fullShift = shifts.find((s) => s.id === calendarEvent.id)
    if (fullShift) dispatch({ type: 'OPEN_DETAIL', payload: fullShift })
  }

  const handleShiftDeleteClick = (calendarEvent: { id: string }) => {
    const fullShift = shifts.find((s) => s.id === calendarEvent.id)
    if (fullShift) dispatch({ type: 'SET_DELETE_TARGET', payload: fullShift })
  }

  const handleRotationBlockClick = (block: RotationGroupCalendarEvent) => {
    const blockShifts = shifts.filter((s) => block.shiftIds.includes(s.id))
    dispatch({
      type: 'OPEN_ROTATION_DETAIL',
      payload: {
        shifts: blockShifts,
        meta: { shiftTypeName: block.title, date: format(block.startTime, 'dd/MM/yyyy') },
      },
    })
  }

  const handleEditShiftFromRotationDetail = (shift: ShiftWithRelations) => {
    dispatch({ type: 'CLOSE_ROTATION_DETAIL' })
    dispatch({ type: 'OPEN_EDIT_DIALOG', payload: shift })
  }

  const handleDeleteConfirm = async () => {
    if (!shiftToDelete) return
    dispatch({ type: 'SET_DELETING', payload: true })
    try {
      const result = await deleteShiftAction(shiftToDelete.id)
      if (result.success) {
        toast.success(tToast('toast.shifts.deleted'))
        dispatch({ type: 'CLEAR_DELETE_TARGET' })
        router.refresh()
        fetchShifts({ ...currentFilters })
      } else toast.error(result.error || tToast('toast.shifts.errorDeleting'))
    } catch {
      toast.error(tToast('toast.shifts.errorDeleting'))
    } finally {
      dispatch({ type: 'SET_DELETING', payload: false })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground mt-2">{t('description')}</p>
        </div>

        <Button type="button" onClick={() => dispatch({ type: 'OPEN_CREATE_DIALOG' })}>
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
            if (!open) dispatch({ type: 'CLOSE_DIALOG' })
          }}
          editingShift={editingShift}
          onSuccess={() => fetchShifts({ ...currentFilters })}
        />
        <AlertDialog
          open={!!shiftToDelete}
          onOpenChange={(open) => !open && dispatch({ type: 'CLEAR_DELETE_TARGET' })}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('deleteConfirm.title')}</AlertDialogTitle>
              <AlertDialogDescription>{t('deleteConfirm.description')}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>{t('form.cancel')}</AlertDialogCancel>
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
        <ShiftDetailSheet
          shift={detailShift}
          open={detailOpen}
          onOpenChange={(open) => {
            if (!open) dispatch({ type: 'CLOSE_DETAIL' })
          }}
          onEdit={(shift) => dispatch({ type: 'OPEN_EDIT_DIALOG', payload: shift })}
          onDelete={(shift) => dispatch({ type: 'SET_DELETE_TARGET', payload: shift })}
        />
      </div>

      <AreaSwitcher
        areas={filteredAreas}
        selectedAreaId={selectedAreaId}
        onAreaChange={handleAreaChange}
      />

      <ShiftStatsCards shifts={shifts} totalCount={totalCount} isPending={isPending} t={t} />

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
          onDayComplete={selectedAreaId ? (date) => dispatch({ type: 'OPEN_COMPLETION', payload: date }) : undefined}
        />

        <RotationShiftsDetailDialog
          open={rotationDetail.open}
          onOpenChange={(open) => !open && dispatch({ type: 'CLOSE_ROTATION_DETAIL' })}
          shifts={rotationDetail.shifts}
          shiftTypeName={rotationDetail.meta.shiftTypeName}
          date={rotationDetail.meta.date}
          onEditShift={handleEditShiftFromRotationDetail}
          getStatusColor={(status) => SHIFT_STATUS_COLORS_HOVER[status as ShiftStatus] ?? 'bg-gray-100 text-gray-800'}
          getStatusLabel={(status) => t(SHIFT_STATUS_I18N_KEYS[status as ShiftStatus] ?? 'status.scheduled')}
        />

        {completionDialog.date && selectedAreaId && (
          <ShiftCompletionDialog
            open={completionDialog.open}
            onOpenChange={(open) => { if (!open) dispatch({ type: 'CLOSE_COMPLETION' }) }}
            date={completionDialog.date}
            areaId={selectedAreaId}
            areaName={areas.find((a) => a.id === selectedAreaId)?.name ?? ''}
            onCompleted={() => fetchShifts({ ...currentFilters })}
          />
        )}

        <ShiftsTableSection
          shifts={shifts}
          isPending={isPending}
          t={t}
          onShiftClick={(shift) => dispatch({ type: 'OPEN_DETAIL', payload: shift })}
        />
      </div>
    </div>
  )
}
