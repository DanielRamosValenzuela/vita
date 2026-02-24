'use client'

import { useCallback, useReducer, useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import {
  CalendarPlus,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Loader2,
  Lock,
  Pencil,
  Plus,
  Power,
  PowerOff,
  RefreshCw,
  Save,
  Trash2,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

import { Link, useRouter } from '@/i18n/navigation'

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
import { Checkbox } from '@/src/shared/ui/checkbox'
import { Input } from '@/src/shared/ui/input'
import { Label } from '@/src/shared/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/shared/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/shared/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/src/shared/ui/tooltip'

import { getShiftTypesAction } from '@/src/features/shifts/api/shift-type-actions'

import {
  deleteRotationAction,
  getRotationAction,
  updateRotationAction,
} from '../api/rotation-actions'
import type { RotationWithRelations } from '../types/rotation-types'
import { CoverageOverview } from './coverage-overview'
import { GenerationDialog } from './generation-dialog'
import { RotationGroupsSection } from './rotation-groups-section'

interface RotationDetailContentProps {
  initialRotation: RotationWithRelations
}

type DeleteDialogState = 'none' | 'open'

interface EditableStep {
  _key: string
  isRestDay: boolean
  shiftTypeId?: string
}

let _detailKey = 0
function genDetailKey() {
  return `dk${++_detailKey}`
}

interface ShiftTypeOption {
  id: string
  name: string
  color: string
}

function getStatusVariant(status: string): 'default' | 'secondary' | 'outline' {
  if (status === 'ACTIVE') return 'default'
  if (status === 'DRAFT') return 'secondary'
  return 'outline'
}

function PatternStep({
  step,
}: {
  step: RotationWithRelations['steps'][number]
}) {
  const t = useTranslations('rotations')

  if (step.isRestDay)
    return (
      <span className="bg-muted text-muted-foreground inline-flex h-7 items-center rounded-full px-2.5 text-xs font-medium">
        {t('steps.free')}
      </span>
    )

  if (!step.shiftType) return null

  return (
    <span
      className="inline-flex h-7 items-center rounded-full px-2.5 text-xs font-medium text-white"
      style={{ backgroundColor: step.shiftType.color }}
    >
      {step.shiftType.name}
    </span>
  )
}

type DetailState = {
  deleteDialogState: DeleteDialogState
  generationOpen: boolean
  regenerateOpen: boolean
  editingConfigs: boolean
  configTimes: Record<string, string>
  editingPattern: boolean
  editSteps: EditableStep[]
  editShiftConfigs: Record<string, string>
  shiftTypes: ShiftTypeOption[]
  loadingShiftTypes: boolean
}

type DetailAction =
  | { type: 'OPEN_DELETE_DIALOG' }
  | { type: 'CLOSE_DELETE_DIALOG' }
  | { type: 'SET_GENERATION_OPEN'; payload: boolean }
  | { type: 'SET_REGENERATE_OPEN'; payload: boolean }
  | { type: 'START_EDIT_CONFIGS'; configTimes: Record<string, string> }
  | { type: 'CANCEL_EDIT_CONFIGS' }
  | { type: 'SET_CONFIG_TIME'; shiftTypeId: string; value: string }
  | { type: 'START_EDIT_PATTERN'; steps: EditableStep[]; configs: Record<string, string> }
  | { type: 'CANCEL_EDIT_PATTERN' }
  | { type: 'SET_EDIT_STEPS'; steps: EditableStep[] }
  | { type: 'SET_EDIT_SHIFT_CONFIGS'; configs: Record<string, string> }
  | { type: 'SET_SHIFT_TYPES'; types: ShiftTypeOption[] }
  | { type: 'SET_LOADING_SHIFT_TYPES'; loading: boolean }
  | { type: 'CONFIGS_SAVED' }
  | { type: 'PATTERN_SAVED' }

const initialDetailState: DetailState = {
  deleteDialogState: 'none',
  generationOpen: false,
  regenerateOpen: false,
  editingConfigs: false,
  configTimes: {},
  editingPattern: false,
  editSteps: [],
  editShiftConfigs: {},
  shiftTypes: [],
  loadingShiftTypes: false,
}

function detailReducer(state: DetailState, action: DetailAction): DetailState {
  switch (action.type) {
    case 'OPEN_DELETE_DIALOG':
      return { ...state, deleteDialogState: 'open' }
    case 'CLOSE_DELETE_DIALOG':
      return { ...state, deleteDialogState: 'none' }
    case 'SET_GENERATION_OPEN':
      return { ...state, generationOpen: action.payload }
    case 'SET_REGENERATE_OPEN':
      return { ...state, regenerateOpen: action.payload }
    case 'START_EDIT_CONFIGS':
      return { ...state, editingConfigs: true, configTimes: action.configTimes }
    case 'CANCEL_EDIT_CONFIGS':
      return { ...state, editingConfigs: false, configTimes: {} }
    case 'SET_CONFIG_TIME':
      return {
        ...state,
        configTimes: { ...state.configTimes, [action.shiftTypeId]: action.value },
      }
    case 'START_EDIT_PATTERN':
      return {
        ...state,
        editingPattern: true,
        editSteps: action.steps,
        editShiftConfigs: action.configs,
      }
    case 'CANCEL_EDIT_PATTERN':
      return { ...state, editingPattern: false, editSteps: [], editShiftConfigs: {} }
    case 'SET_EDIT_STEPS':
      return { ...state, editSteps: action.steps }
    case 'SET_EDIT_SHIFT_CONFIGS':
      return { ...state, editShiftConfigs: action.configs }
    case 'SET_SHIFT_TYPES':
      return { ...state, shiftTypes: action.types }
    case 'SET_LOADING_SHIFT_TYPES':
      return { ...state, loadingShiftTypes: action.loading }
    case 'CONFIGS_SAVED':
      return { ...state, editingConfigs: false, configTimes: {} }
    case 'PATTERN_SAVED':
      return { ...state, editingPattern: false, editSteps: [], editShiftConfigs: {} }
    default:
      return state
  }
}

interface PatternReadViewProps {
  steps: RotationWithRelations['steps']
}

function PatternReadView({ steps }: PatternReadViewProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {steps.map((step) => (
        <PatternStep key={step.id} step={step} />
      ))}
    </div>
  )
}

interface PatternEditViewProps {
  editSteps: EditableStep[]
  editShiftConfigs: Record<string, string>
  shiftTypes: ShiftTypeOption[]
  loadingShiftTypes: boolean
  isPending: boolean
  dispatch: React.Dispatch<DetailAction>
  t: ReturnType<typeof useTranslations<'rotations'>>
  onSave: () => void
}

function PatternEditView({
  editSteps,
  editShiftConfigs,
  shiftTypes,
  loadingShiftTypes,
  isPending,
  dispatch,
  t,
  onSave,
}: PatternEditViewProps) {
  const usedShiftTypeIds = Array.from(
    new Set(
      editSteps
        .filter((s) => !s.isRestDay && s.shiftTypeId)
        .map((s) => s.shiftTypeId as string)
    )
  )

  const isPatternValid = (() => {
    if (editSteps.length < 2) return false
    if (editSteps.some((s) => !s.isRestDay && !s.shiftTypeId)) return false
    if (usedShiftTypeIds.some((id) => !editShiftConfigs[id] || !/^\d{2}:\d{2}$/.test(editShiftConfigs[id]))) return false
    return true
  })()

  const handleStepToggleRest = (index: number, checked: boolean) => {
    dispatch({
      type: 'SET_EDIT_STEPS',
      steps: editSteps.map((s, i) =>
        i === index ? { ...s, _key: s._key, isRestDay: checked, shiftTypeId: undefined } : s
      ),
    })
  }

  const handleStepShiftType = (index: number, value: string) => {
    dispatch({
      type: 'SET_EDIT_STEPS',
      steps: editSteps.map((s, i) => (i === index ? { ...s, shiftTypeId: value } : s)),
    })
  }

  const handleMoveStep = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1
    if (target < 0 || target >= editSteps.length) return
    const next = [...editSteps]
    const temp = next[index]
    next[index] = next[target]
    next[target] = temp
    dispatch({ type: 'SET_EDIT_STEPS', steps: next })
  }

  const handleRemoveStep = (index: number) => {
    if (editSteps.length <= 2) return
    dispatch({
      type: 'SET_EDIT_STEPS',
      steps: editSteps.filter((_, i) => i !== index),
    })
  }

  const handleAddStep = () => {
    if (editSteps.length >= 8) return
    dispatch({
      type: 'SET_EDIT_STEPS',
      steps: [...editSteps, { _key: genDetailKey(), isRestDay: false }],
    })
  }

  const handleShiftConfigChange = (stId: string, value: string) => {
    dispatch({
      type: 'SET_EDIT_SHIFT_CONFIGS',
      configs: { ...editShiftConfigs, [stId]: value },
    })
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {editSteps.map((step, index) => (
          <div
            key={step._key}
            className="bg-muted/40 flex items-center gap-2 rounded-md border px-3 py-2"
          >
            <span className="text-muted-foreground w-14 shrink-0 text-xs">
              {t('steps.day', { number: index + 1 })}
            </span>
            <div className="flex items-center gap-1.5">
              <Checkbox
                id={`edit-step-rest-${index}`}
                checked={step.isRestDay}
                onCheckedChange={(checked) =>
                  handleStepToggleRest(index, checked === true)
                }
                disabled={isPending}
              />
              <Label
                htmlFor={`edit-step-rest-${index}`}
                className="cursor-pointer text-xs font-normal"
              >
                {t('steps.restDay')}
              </Label>
            </div>
            {!step.isRestDay && (
              <div className="flex-1">
                {loadingShiftTypes ? (
                  <span className="text-muted-foreground flex items-center gap-1 text-xs">
                    <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
                    {t('form.loadingShiftTypes')}
                  </span>
                ) : (
                  <Select
                    value={step.shiftTypeId ?? ''}
                    onValueChange={(v) => handleStepShiftType(index, v)}
                    disabled={isPending}
                  >
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue placeholder={t('steps.shiftTypePlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {shiftTypes.map((st) => (
                        <SelectItem key={st.id} value={st.id}>
                          <span className="flex items-center gap-1.5">
                            <span
                              className="inline-block h-2 w-2 shrink-0 rounded-full"
                              style={{ backgroundColor: st.color }}
                              aria-hidden
                            />
                            {st.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}
            {step.isRestDay && <div className="flex-1" />}
            <div className="flex shrink-0 items-center gap-0.5">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => handleMoveStep(index, 'up')}
                disabled={isPending || index === 0}
                aria-label={t('steps.moveUp')}
              >
                <ChevronUp className="h-3 w-3" aria-hidden />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => handleMoveStep(index, 'down')}
                disabled={isPending || index === editSteps.length - 1}
                aria-label={t('steps.moveDown')}
              >
                <ChevronDown className="h-3 w-3" aria-hidden />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => handleRemoveStep(index)}
                disabled={isPending || editSteps.length <= 2}
                aria-label={t('steps.removeStep')}
              >
                <X className="h-3 w-3" aria-hidden />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {editSteps.length < 8 && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddStep}
          disabled={isPending}
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" aria-hidden />
          {t('steps.addStep')}
        </Button>
      )}

      {usedShiftTypeIds.length > 0 && (
        <div className="space-y-2 border-t pt-3">
          <p className="text-sm font-medium">{t('detail.shiftConfigsTitle')}</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {usedShiftTypeIds.map((stId) => {
              const st = shiftTypes.find((s) => s.id === stId)
              if (!st) return null
              return (
                <div key={stId} className="flex items-center gap-3">
                  <span
                    className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: st.color }}
                    aria-hidden
                  />
                  <Label className="min-w-0 flex-1 truncate text-sm">
                    {st.name}
                  </Label>
                  <Input
                    type="time"
                    value={editShiftConfigs[stId] ?? ''}
                    onChange={(e) => handleShiftConfigChange(stId, e.target.value)}
                    className="w-32 shrink-0"
                    disabled={isPending}
                  />
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => dispatch({ type: 'CANCEL_EDIT_PATTERN' })}
          disabled={isPending}
        >
          {t('form.cancel')}
        </Button>
        <Button
          size="sm"
          onClick={onSave}
          disabled={!isPatternValid || isPending}
          className="gap-1.5"
        >
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
          ) : (
            <Save className="h-3.5 w-3.5" aria-hidden />
          )}
          {t('detail.savePattern')}
        </Button>
      </div>
    </div>
  )
}

interface ShiftConfigsCardProps {
  shiftConfigs: RotationWithRelations['shiftConfigs']
  editingConfigs: boolean
  configTimes: Record<string, string>
  isPending: boolean
  dispatch: React.Dispatch<DetailAction>
  t: ReturnType<typeof useTranslations<'rotations'>>
  onSave: () => void
}

function ShiftConfigsCard({
  shiftConfigs,
  editingConfigs,
  configTimes,
  isPending,
  dispatch,
  t,
  onSave,
}: ShiftConfigsCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold uppercase tracking-wide">
            {t('detail.shiftConfigsTitle')}
          </CardTitle>
          {!editingConfigs && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => {
                    const times: Record<string, string> = {}
                    for (const cfg of shiftConfigs)
                      times[cfg.shiftTypeId] = cfg.startTime
                    dispatch({ type: 'START_EDIT_CONFIGS', configTimes: times })
                  }}
                  disabled={isPending}
                >
                  <Pencil className="h-3.5 w-3.5" aria-hidden />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('detail.editConfigs')}</TooltipContent>
            </Tooltip>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('detail.shiftType')}</TableHead>
                <TableHead>{t('detail.startTime')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shiftConfigs.map((cfg) => (
                <TableRow key={cfg.id}>
                  <TableCell className="font-medium">
                    {cfg.shiftType.name}
                  </TableCell>
                  <TableCell>
                    {editingConfigs ? (
                      <Input
                        type="time"
                        value={configTimes[cfg.shiftTypeId] ?? cfg.startTime}
                        onChange={(e) =>
                          dispatch({
                            type: 'SET_CONFIG_TIME',
                            shiftTypeId: cfg.shiftTypeId,
                            value: e.target.value,
                          })
                        }
                        className="h-8 w-32 font-mono"
                        disabled={isPending}
                      />
                    ) : (
                      <span className="font-mono">{cfg.startTime}</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {editingConfigs && (
          <div className="mt-3 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => dispatch({ type: 'CANCEL_EDIT_CONFIGS' })}
              disabled={isPending}
            >
              {t('form.cancel')}
            </Button>
            <Button
              size="sm"
              onClick={onSave}
              disabled={isPending}
              className="gap-1.5"
            >
              {isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
              ) : (
                <Save className="h-3.5 w-3.5" aria-hidden />
              )}
              {t('detail.saveConfigs')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface DetailFooterProps {
  rotation: RotationWithRelations
  state: DetailState
  isPending: boolean
  dispatch: React.Dispatch<DetailAction>
  t: ReturnType<typeof useTranslations<'rotations'>>
  onActivate: () => void
  onDeactivate: () => void
  onDelete: (deleteLinkedShifts: boolean) => void
  onMemberChanged: () => void
}

function DetailFooter({
  rotation,
  state,
  isPending,
  dispatch,
  t,
  onActivate,
  onDeactivate,
  onDelete,
  onMemberChanged,
}: DetailFooterProps) {
  return (
    <>
      <footer className="flex flex-wrap items-center justify-end gap-2 border-t pt-4">
        {rotation.status === 'ACTIVE' ? (
          <Button
            variant="outline"
            onClick={onDeactivate}
            disabled={isPending}
            className="gap-2"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <PowerOff className="h-4 w-4" aria-hidden />
            )}
            {t('detail.deactivate')}
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={onActivate}
            disabled={isPending}
            className="gap-2"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Power className="h-4 w-4" aria-hidden />
            )}
            {t('detail.activate')}
          </Button>
        )}
        {rotation.status === 'ACTIVE' && (
          <>
            <Button
              variant="outline"
              onClick={() => dispatch({ type: 'SET_REGENERATE_OPEN', payload: true })}
              disabled={isPending}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" aria-hidden />
              {t('form.regenerate')}
            </Button>
            <Button
              variant="default"
              onClick={() => dispatch({ type: 'SET_GENERATION_OPEN', payload: true })}
              disabled={isPending}
              className="gap-2"
            >
              <CalendarPlus className="h-4 w-4" aria-hidden />
              {t('generation.generateShifts')}
            </Button>
          </>
        )}
        <Button
          variant="destructive"
          onClick={() => dispatch({ type: 'OPEN_DELETE_DIALOG' })}
          disabled={isPending}
          className="gap-2"
        >
          <Trash2 className="h-4 w-4" aria-hidden />
          {t('detail.delete')}
        </Button>
      </footer>

      <AlertDialog
        open={state.deleteDialogState === 'open'}
        onOpenChange={(isOpen) => {
          if (!isOpen) dispatch({ type: 'CLOSE_DELETE_DIALOG' })
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('detail.deleteConfirm')}</AlertDialogTitle>
            <AlertDialogDescription>{t('detail.deleteDescription')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
            <AlertDialogCancel disabled={isPending}>{t('form.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(false)}
              disabled={isPending}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/80"
            >
              {t('detail.unlinkShifts')}
            </AlertDialogAction>
            <AlertDialogAction
              onClick={() => onDelete(true)}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('detail.deleteShifts')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <GenerationDialog
        rotationId={rotation.id}
        rotationName={rotation.name}
        open={state.generationOpen}
        onOpenChange={(v) => dispatch({ type: 'SET_GENERATION_OPEN', payload: v })}
        onGenerated={onMemberChanged}
      />
      <GenerationDialog
        rotationId={rotation.id}
        rotationName={rotation.name}
        open={state.regenerateOpen}
        onOpenChange={(v) => dispatch({ type: 'SET_REGENERATE_OPEN', payload: v })}
        onGenerated={onMemberChanged}
        regenerateMode
      />
    </>
  )
}

export function RotationDetailContent({
  initialRotation,
}: RotationDetailContentProps) {
  const t = useTranslations('rotations')
  const router = useRouter()

  const [rotation, setRotation] = useState<RotationWithRelations>(() => initialRotation)

  const [state, dispatch] = useReducer(detailReducer, initialDetailState)
  const [isPending, startTransition] = useTransition()

  const hasShifts = rotation._count.shifts > 0
  const canEditPattern = !hasShifts

  const fetchRotation = useCallback(async (id: string) => {
    const result = await getRotationAction(id)

    if (result.success && result.data)
      setRotation(result.data)
    else
      toast.error(result.error ?? t('loadError'))
  }, [t])

  const handleMemberChanged = () => {
    fetchRotation(rotation.id)
  }

  const handleActivate = () => {
    startTransition(async () => {
      const result = await updateRotationAction(rotation.id, { status: 'ACTIVE' })

      if (result.success) {
        toast.success(t('detail.activateSuccess'))
        if (result.data) setRotation(result.data)
      } else
        toast.error(result.error ?? t('loadError'))
    })
  }

  const handleDeactivate = () => {
    startTransition(async () => {
      const result = await updateRotationAction(rotation.id, { status: 'INACTIVE' })

      if (result.success) {
        toast.success(t('detail.deactivateSuccess'))
        if (result.data) setRotation(result.data)
      } else
        toast.error(result.error ?? t('loadError'))
    })
  }

  const handleDelete = (deleteLinkedShifts: boolean) => {
    startTransition(async () => {
      const result = await deleteRotationAction(rotation.id, deleteLinkedShifts)

      if (result.success) {
        toast.success(t('detail.deleteSuccess'))
        dispatch({ type: 'CLOSE_DELETE_DIALOG' })
        router.push('/dashboard/rotations')
      } else
        toast.error(result.error ?? t('loadError'))
    })
  }

  const handleSaveConfigs = () => {
    const shiftConfigs = Object.entries(state.configTimes).map(([shiftTypeId, startTime]) => ({
      shiftTypeId,
      startTime,
    }))

    startTransition(async () => {
      const result = await updateRotationAction(rotation.id, { shiftConfigs })

      if (result.success) {
        toast.success(t('detail.configsSaved'))
        if (result.data) setRotation(result.data)
        dispatch({ type: 'CONFIGS_SAVED' })
      } else
        toast.error(result.error ?? t('loadError'))
    })
  }

  const startEditPattern = () => {
    if (!canEditPattern) return

    const steps = rotation.steps.map((s) => ({
      _key: genDetailKey(),
      isRestDay: s.isRestDay,
      shiftTypeId: s.shiftType?.id,
    }))

    const configs: Record<string, string> = {}
    for (const cfg of rotation.shiftConfigs)
      configs[cfg.shiftTypeId] = cfg.startTime

    dispatch({ type: 'START_EDIT_PATTERN', steps, configs })

    dispatch({ type: 'SET_LOADING_SHIFT_TYPES', loading: true })
    getShiftTypesAction()
      .then((result) => {
        if (result.success && result.data) {
          const areaTypes = result.data.filter(
            (st) =>
              st.isGlobal ||
              st.areaShiftTypes?.some((ast) => ast.areaId === rotation.areaId)
          )
          dispatch({
            type: 'SET_SHIFT_TYPES',
            types: areaTypes.map((st) => ({ id: st.id, name: st.name, color: st.color })),
          })
        }
      })
      .finally(() => dispatch({ type: 'SET_LOADING_SHIFT_TYPES', loading: false }))
  }

  const handleSavePattern = () => {
    const usedShiftTypeIds = Array.from(
      new Set(
        state.editSteps
          .filter((s) => !s.isRestDay && s.shiftTypeId)
          .map((s) => s.shiftTypeId as string)
      )
    )

    const steps = state.editSteps.map((s, i) => ({
      order: i,
      isRestDay: s.isRestDay,
      shiftTypeId: s.isRestDay ? undefined : s.shiftTypeId,
    }))

    const shiftConfigs = usedShiftTypeIds.map((shiftTypeId) => ({
      shiftTypeId,
      startTime: state.editShiftConfigs[shiftTypeId],
    }))

    startTransition(async () => {
      const result = await updateRotationAction(rotation.id, { steps, shiftConfigs })

      if (result.success) {
        toast.success(t('detail.patternSaved'))
        if (result.data) setRotation(result.data)
        dispatch({ type: 'PATTERN_SAVED' })
      } else
        toast.error(result.error ?? t('loadError'))
    })
  }

  return (
    <>
      <div className="space-y-6">
        <header className="flex items-center gap-4">
          <Link href="/dashboard/rotations">
            <Button variant="ghost" size="icon" aria-label={t('detail.backToList')}>
              <ArrowLeft className="h-5 w-5" aria-hidden />
            </Button>
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-bold tracking-tight">{rotation.name}</h1>
            <p className="text-muted-foreground mt-1">{rotation.area.name}</p>
          </div>
          <Badge variant={getStatusVariant(rotation.status)}>
            {t(`status.${rotation.status}`)}
          </Badge>
        </header>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold uppercase tracking-wide">
                {t('detail.patternTitle')}
              </CardTitle>
              {!state.editingPattern && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={startEditPattern}
                        disabled={!canEditPattern || isPending}
                      >
                        {canEditPattern ? (
                          <Pencil className="h-3.5 w-3.5" aria-hidden />
                        ) : (
                          <Lock className="h-3.5 w-3.5" aria-hidden />
                        )}
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    {canEditPattern ? t('detail.editPattern') : t('detail.patternLocked')}
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {state.editingPattern ? (
              <PatternEditView
                editSteps={state.editSteps}
                editShiftConfigs={state.editShiftConfigs}
                shiftTypes={state.shiftTypes}
                loadingShiftTypes={state.loadingShiftTypes}
                isPending={isPending}
                dispatch={dispatch}
                t={t}
                onSave={handleSavePattern}
              />
            ) : (
              <PatternReadView steps={rotation.steps} />
            )}
          </CardContent>
        </Card>

        {(rotation.shiftConfigs.length > 0 && !state.editingPattern) && (
          <ShiftConfigsCard
            shiftConfigs={rotation.shiftConfigs}
            editingConfigs={state.editingConfigs}
            configTimes={state.configTimes}
            isPending={isPending}
            dispatch={dispatch}
            t={t}
            onSave={handleSaveConfigs}
          />
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold uppercase tracking-wide">
              {t('common.groups')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RotationGroupsSection
              rotation={rotation}
              onMemberChanged={handleMemberChanged}
            />
          </CardContent>
        </Card>

        {rotation.status === 'ACTIVE' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold uppercase tracking-wide">
                {t('coverage.coverageOverview')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CoverageOverview rotationId={rotation.id} areaId={rotation.area.id} />
            </CardContent>
          </Card>
        )}

        <DetailFooter
          rotation={rotation}
          state={state}
          isPending={isPending}
          dispatch={dispatch}
          t={t}
          onActivate={handleActivate}
          onDeactivate={handleDeactivate}
          onDelete={handleDelete}
          onMemberChanged={handleMemberChanged}
        />
      </div>
    </>
  )
}
