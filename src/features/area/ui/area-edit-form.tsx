'use client'

import { useMemo, useReducer, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/src/shared/ui/button'

import { useRouter } from '@/i18n/navigation'

import {
  assignChiefsToAreaAction,
  assignShiftTypesToAreaAction,
  assignStaffToAreaAction,
  setAreaActiveAction,
  updateAreaAction,
} from '../api'
import type { ChiefOption, StaffOption } from '../api/area-actions'

import { AreaBasicInfoCard } from './area-basic-info-card'
import { AreaChiefsCard } from './area-chiefs-card'
import { AreaShiftTypesCard } from './area-shift-types-card'
import type { ShiftTypeOption } from './area-shift-types-card'
import { AreaStaffCard } from './area-staff-card'
import { AreaStatusCard } from './area-status-card'
import { AreaWorkLimitsCard } from './area-work-limits-card'
import {
  areaFormReducer,
  createInitialState,
  hasAreaFormChanged,
} from './area-edit-utils'

export interface AreaEditFormProps {
  area: {
    id: string
    name: string
    description: string | null
    icon: string | null
    color: string
    isActive: boolean
    maxConsecutiveHours?: number | null
    minRestHours?: number | null
    dayStartTime?: string | null
    dayEndTime?: string | null
    shiftTypes: Array<{
      isActive: boolean
      shiftType: {
        id: string
        name: string
        durationMinutes: number
        classification: string
        color: string
      }
    }>
  }
  shiftTypes: ShiftTypeOption[]
  canAssignChiefs?: boolean
  chiefs?: ChiefOption[]
  initialAssignedChiefIds?: Set<string>
  staff?: StaffOption[]
  initialAssignedStaffIds?: Set<string>
}

const EMPTY_CHIEFS: ChiefOption[] = []
const EMPTY_STAFF: StaffOption[] = []

export function AreaEditForm({
  area,
  shiftTypes,
  canAssignChiefs = false,
  chiefs = EMPTY_CHIEFS,
  initialAssignedChiefIds = new Set(),
  staff = EMPTY_STAFF,
  initialAssignedStaffIds = new Set(),
}: AreaEditFormProps) {
  const t = useTranslations('adminHR.areas')
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [state, dispatch] = useReducer(
    areaFormReducer,
    createInitialState(area, initialAssignedChiefIds, initialAssignedStaffIds)
  )

  const initialSelectedIds = useMemo(
    () => new Set(area.shiftTypes.filter((ast) => ast.isActive).map((ast) => ast.shiftType.id)),
    [area.shiftTypes]
  )

  const canActivate = state.selectedShiftTypeIds.size > 0
  const hasChanges = useMemo(
    () =>
      hasAreaFormChanged(
        state,
        area,
        initialSelectedIds,
        canAssignChiefs,
        initialAssignedChiefIds,
        initialAssignedStaffIds
      ),
    [
      state,
      area,
      initialSelectedIds,
      canAssignChiefs,
      initialAssignedChiefIds,
      initialAssignedStaffIds,
    ]
  )

  const performSave = () => {
    if (!state.name.trim()) {
      toast.error(t('form.nameRequired'))
      return
    }

    startTransition(async () => {
      dispatch({ type: 'TOGGLE_SAVE_CONFIRM', value: false })

      const assignResult = await assignShiftTypesToAreaAction(
        area.id,
        Array.from(state.selectedShiftTypeIds)
      )
      if (!assignResult.success) {
        toast.error(assignResult.error)
        return
      }

      if (canAssignChiefs) {
        const chiefsResult = await assignChiefsToAreaAction(
          area.id,
          Array.from(state.selectedChiefIds)
        )
        if (!chiefsResult.success) {
          toast.error(chiefsResult.error)
          return
        }
      }

      const staffResult = await assignStaffToAreaAction(area.id, Array.from(state.selectedStaffIds))
      if (!staffResult.success) {
        toast.error(staffResult.error)
        return
      }

      const updateResult = await updateAreaAction(area.id, {
        name: state.name.trim(),
        description: state.description || undefined,
        icon: state.icon,
        color: state.color,
        maxConsecutiveHours: state.maxConsecutiveHours
          ? parseInt(state.maxConsecutiveHours, 10) || null
          : null,
        minRestHours: state.minRestHours ? parseInt(state.minRestHours, 10) || null : null,
        dayStartTime: state.dayStartTime || null,
        dayEndTime: state.dayEndTime || null,
      })
      if (!updateResult.success) {
        toast.error(updateResult.error)
        return
      }

      const targetActive = canActivate && state.isActive
      const setActiveResult = await setAreaActiveAction(area.id, targetActive)
      if (!setActiveResult.success) {
        toast.error(setActiveResult.error)
        return
      }

      toast.success(t('editSuccess'))
      router.push('/dashboard/areas')
    })
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/dashboard/areas">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('back')}
        </Link>
      </Button>

      <AreaBasicInfoCard
        name={state.name}
        description={state.description}
        icon={state.icon}
        color={state.color}
        dispatch={dispatch}
      />

      <AreaShiftTypesCard
        shiftTypes={shiftTypes}
        selectedShiftTypeIds={state.selectedShiftTypeIds}
        dispatch={dispatch}
      />

      <AreaChiefsCard
        canAssignChiefs={canAssignChiefs}
        chiefs={chiefs}
        selectedChiefIds={state.selectedChiefIds}
        initialAssignedChiefIds={initialAssignedChiefIds}
        dispatch={dispatch}
      />

      <AreaStaffCard
        staff={staff}
        selectedStaffIds={state.selectedStaffIds}
        dispatch={dispatch}
      />

      <AreaWorkLimitsCard
        maxConsecutiveHours={state.maxConsecutiveHours}
        minRestHours={state.minRestHours}
        dayStartTime={state.dayStartTime}
        dayEndTime={state.dayEndTime}
        dispatch={dispatch}
      />

      <AreaStatusCard
        isActive={state.isActive}
        canActivate={canActivate}
        hasChanges={hasChanges}
        isPending={isPending}
        showSaveConfirm={state.showSaveConfirm}
        dispatch={dispatch}
        onPerformSave={performSave}
      />
    </div>
  )
}
