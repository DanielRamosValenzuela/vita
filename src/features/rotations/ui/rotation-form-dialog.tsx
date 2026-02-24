'use client'

import { useReducer, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { ChevronDown, ChevronUp, Loader2, Minus, Plus, X } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/src/shared/ui/button'
import { Checkbox } from '@/src/shared/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/src/shared/ui/dialog'
import { Input } from '@/src/shared/ui/input'
import { Label } from '@/src/shared/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/shared/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/src/shared/ui/popover'
import { Textarea } from '@/src/shared/ui/textarea'
import { AREA_ICONS } from '@/src/shared/lib/constants/icons'
import { cn } from '@/src/shared/lib/utils'
import { IconDisplay, IconPicker } from '@/src/shared/ui/icon-picker'

import { getShiftTypesAction } from '@/src/features/shifts/api/shift-type-actions'
import { PREDEFINED_COLORS } from '@/src/features/shifts/ui/shift-types-utils'

import { createRotationAction } from '../api/rotation-actions'

interface RotationFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  areas: Array<{ id: string; name: string }>
  onCreated: () => void
}

interface Step {
  _key: string
  isRestDay: boolean
  shiftTypeId?: string
}

interface Group {
  _key: string
  name: string
  color: string
  icon: string
}

let _nextKey = 0
function genKey() {
  return `k${++_nextKey}`
}

interface ShiftTypeOption {
  id: string
  name: string
  color: string
}

function isValidTime(value: string): boolean {
  return /^\d{2}:\d{2}$/.test(value)
}

type FormState = {
  name: string
  description: string
  areaId: string
  steps: Step[]
  groups: Group[]
  shiftConfigs: Record<string, string>
  shiftTypes: ShiftTypeOption[]
  loadingShiftTypes: boolean
}

type FormAction =
  | { type: 'RESET' }
  | { type: 'SET_NAME'; payload: string }
  | { type: 'SET_DESCRIPTION'; payload: string }
  | { type: 'SET_AREA'; payload: string }
  | { type: 'SET_STEPS'; payload: Step[] }
  | { type: 'SET_GROUPS'; payload: Group[] }
  | { type: 'SET_SHIFT_CONFIGS'; payload: Record<string, string> }
  | { type: 'SET_SHIFT_TYPES'; payload: ShiftTypeOption[] }
  | { type: 'SET_LOADING_SHIFT_TYPES'; payload: boolean }
  | { type: 'UPDATE_STEP'; index: number; step: Step }
  | { type: 'ADD_STEP' }
  | { type: 'REMOVE_STEP'; index: number }
  | { type: 'SWAP_STEPS'; indexA: number; indexB: number }
  | { type: 'UPDATE_GROUP'; index: number; group: Group }
  | { type: 'ADD_GROUP' }
  | { type: 'REMOVE_GROUP'; index: number }
  | { type: 'SET_CONFIG_TIME'; shiftTypeId: string; value: string }

function makeInitialState(): FormState {
  return {
    name: '',
    description: '',
    areaId: '',
    steps: [
      { _key: genKey(), isRestDay: false },
      { _key: genKey(), isRestDay: false },
    ],
    groups: [
      { _key: genKey(), name: 'A', color: '#3b82f6', icon: 'Users' },
      { _key: genKey(), name: 'B', color: '#10b981', icon: 'Users' },
    ],
    shiftConfigs: {},
    shiftTypes: [],
    loadingShiftTypes: false,
  }
}

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'RESET':
      return makeInitialState()
    case 'SET_NAME':
      return { ...state, name: action.payload }
    case 'SET_DESCRIPTION':
      return { ...state, description: action.payload }
    case 'SET_AREA':
      return { ...state, areaId: action.payload }
    case 'SET_STEPS':
      return { ...state, steps: action.payload }
    case 'SET_GROUPS':
      return { ...state, groups: action.payload }
    case 'SET_SHIFT_CONFIGS':
      return { ...state, shiftConfigs: action.payload }
    case 'SET_SHIFT_TYPES':
      return { ...state, shiftTypes: action.payload }
    case 'SET_LOADING_SHIFT_TYPES':
      return { ...state, loadingShiftTypes: action.payload }
    case 'UPDATE_STEP': {
      const steps = state.steps.map((s, i) => (i === action.index ? action.step : s))
      return { ...state, steps }
    }
    case 'ADD_STEP':
      if (state.steps.length >= 8) return state
      return { ...state, steps: [...state.steps, { _key: genKey(), isRestDay: false }] }
    case 'REMOVE_STEP':
      if (state.steps.length <= 2) return state
      return { ...state, steps: state.steps.filter((_, i) => i !== action.index) }
    case 'SWAP_STEPS': {
      const { indexA, indexB } = action
      if (indexA < 0 || indexB < 0 || indexA >= state.steps.length || indexB >= state.steps.length)
        return state
      const steps = [...state.steps]
      const temp = steps[indexA]
      steps[indexA] = steps[indexB]
      steps[indexB] = temp
      return { ...state, steps }
    }
    case 'UPDATE_GROUP': {
      const groups = state.groups.map((g, i) => (i === action.index ? action.group : g))
      return { ...state, groups }
    }
    case 'ADD_GROUP': {
      if (state.groups.length >= 6) return state
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      const colorIndex = state.groups.length % PREDEFINED_COLORS.length
      const newGroup: Group = {
        _key: genKey(),
        name: letters[state.groups.length] ?? '',
        color: PREDEFINED_COLORS[colorIndex],
        icon: 'Users',
      }
      return { ...state, groups: [...state.groups, newGroup] }
    }
    case 'REMOVE_GROUP':
      if (state.groups.length <= 2) return state
      return { ...state, groups: state.groups.filter((_, i) => i !== action.index) }
    case 'SET_CONFIG_TIME':
      return {
        ...state,
        shiftConfigs: { ...state.shiftConfigs, [action.shiftTypeId]: action.value },
      }
    default:
      return state
  }
}

interface StepRowProps {
  step: Step
  index: number
  stepsLength: number
  areaId: string
  loadingShiftTypes: boolean
  shiftTypes: ShiftTypeOption[]
  isPending: boolean
  t: ReturnType<typeof useTranslations<'rotations'>>
  onToggleRest: (index: number, checked: boolean) => void
  onShiftType: (index: number, value: string) => void
  onMove: (index: number, direction: 'up' | 'down') => void
  onRemove: (index: number) => void
}

function StepRow({
  step,
  index,
  stepsLength,
  areaId,
  loadingShiftTypes,
  shiftTypes,
  isPending,
  t,
  onToggleRest,
  onShiftType,
  onMove,
  onRemove,
}: StepRowProps) {
  return (
    <div className="bg-muted/40 flex items-center gap-2 rounded-md border px-3 py-2">
      <span className="text-muted-foreground w-14 shrink-0 text-xs">
        {t('steps.day', { number: index + 1 })}
      </span>

      <div className="flex items-center gap-1.5">
        <Checkbox
          id={`step-rest-${index}`}
          checked={step.isRestDay}
          onCheckedChange={(checked) => onToggleRest(index, checked === true)}
          disabled={isPending}
        />
        <Label
          htmlFor={`step-rest-${index}`}
          className="cursor-pointer text-xs font-normal"
        >
          {t('steps.restDay')}
        </Label>
      </div>

      {!step.isRestDay && (
        <div className="flex-1">
          {!areaId ? (
            <span className="text-muted-foreground text-xs italic">
              {t('form.selectAreaFirst')}
            </span>
          ) : loadingShiftTypes ? (
            <span className="text-muted-foreground flex items-center gap-1 text-xs">
              <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
              {t('form.loadingShiftTypes')}
            </span>
          ) : shiftTypes.length === 0 ? (
            <span className="text-muted-foreground text-xs italic">
              {t('form.noShiftTypes')}
            </span>
          ) : (
            <Select
              value={step.shiftTypeId ?? ''}
              onValueChange={(v) => onShiftType(index, v)}
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
          onClick={() => onMove(index, 'up')}
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
          onClick={() => onMove(index, 'down')}
          disabled={isPending || index === stepsLength - 1}
          aria-label={t('steps.moveDown')}
        >
          <ChevronDown className="h-3 w-3" aria-hidden />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => onRemove(index)}
          disabled={isPending || stepsLength <= 2}
          aria-label={t('steps.removeStep')}
        >
          <X className="h-3 w-3" aria-hidden />
        </Button>
      </div>
    </div>
  )
}

interface GroupEditorProps {
  group: Group
  index: number
  groupsLength: number
  isPending: boolean
  t: ReturnType<typeof useTranslations<'rotations'>>
  onNameChange: (index: number, value: string) => void
  onColorChange: (index: number, value: string) => void
  onIconChange: (index: number, value: string) => void
  onRemove: (index: number) => void
}

function GroupEditor({
  group,
  index,
  groupsLength,
  isPending,
  t,
  onNameChange,
  onColorChange,
  onIconChange,
  onRemove,
}: GroupEditorProps) {
  return (
    <div className="space-y-2 rounded-lg border p-3">
      <div className="flex items-center gap-2">
        <div
          className="h-4 w-4 shrink-0 rounded-full"
          style={{ backgroundColor: group.color }}
          aria-hidden
        />
        <Input
          value={group.name}
          onChange={(e) => onNameChange(index, e.target.value)}
          placeholder={t('form.groupNamePlaceholder')}
          maxLength={20}
          className="flex-1"
          disabled={isPending}
          aria-label={t('groups.groupName', { letter: String.fromCharCode(65 + index) })}
        />
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 shrink-0"
              disabled={isPending}
              aria-label={t('form.selectIcon')}
            >
              <IconDisplay iconName={group.icon} size={16} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <IconPicker
              value={group.icon}
              onChange={(v) => onIconChange(index, v)}
              icons={AREA_ICONS}
              searchPlaceholder={t('form.iconSearch')}
              statusLabel={(showing, total, hasSearch) =>
                hasSearch
                  ? t('form.iconShowing', { showing, total })
                  : t('form.iconTotal', { total })
              }
            />
          </PopoverContent>
        </Popover>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onRemove(index)}
          disabled={isPending || groupsLength <= 2}
          aria-label={t('form.removeGroup')}
        >
          <Minus className="h-4 w-4" aria-hidden />
        </Button>
      </div>
      <div className="flex flex-wrap gap-1 pl-6">
        {PREDEFINED_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            className={cn(
              'h-5 w-5 cursor-pointer rounded-full border-2 transition-colors',
              group.color === color
                ? 'scale-110 border-foreground'
                : 'border-transparent hover:border-muted-foreground/50'
            )}
            style={{ backgroundColor: color }}
            onClick={() => onColorChange(index, color)}
            disabled={isPending}
            aria-label={color}
          />
        ))}
      </div>
    </div>
  )
}

interface RotationFormBodyProps {
  state: FormState
  areas: Array<{ id: string; name: string }>
  usedShiftTypeIds: string[]
  isPending: boolean
  dispatch: React.Dispatch<FormAction>
  t: ReturnType<typeof useTranslations<'rotations'>>
  onAreaChange: (value: string) => void
  onStepToggleRest: (index: number, checked: boolean) => void
  onStepShiftType: (index: number, value: string) => void
  onMoveStep: (index: number, direction: 'up' | 'down') => void
  onRemoveStep: (index: number) => void
  onAddStep: () => void
  onConfigTime: (shiftTypeId: string, value: string) => void
  onGroupNameChange: (index: number, value: string) => void
  onGroupColorChange: (index: number, value: string) => void
  onGroupIconChange: (index: number, value: string) => void
  onRemoveGroup: (index: number) => void
  onAddGroup: () => void
}

function RotationFormBody({
  state,
  areas,
  usedShiftTypeIds,
  isPending,
  dispatch,
  t,
  onAreaChange,
  onStepToggleRest,
  onStepShiftType,
  onMoveStep,
  onRemoveStep,
  onAddStep,
  onConfigTime,
  onGroupNameChange,
  onGroupColorChange,
  onGroupIconChange,
  onRemoveGroup,
  onAddGroup,
}: RotationFormBodyProps) {
  const { name, description, areaId, steps, groups, shiftConfigs, shiftTypes, loadingShiftTypes } =
    state

  return (
    <div className="flex-1 overflow-y-auto pr-1">
      <div className="space-y-6 py-1">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="rotation-name">{t('form.name')}</Label>
            <Input
              id="rotation-name"
              value={name}
              onChange={(e) => dispatch({ type: 'SET_NAME', payload: e.target.value })}
              placeholder={t('form.namePlaceholder')}
              maxLength={100}
              disabled={isPending}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rotation-area">{t('form.area')}</Label>
            <Select value={areaId} onValueChange={onAreaChange} disabled={isPending}>
              <SelectTrigger id="rotation-area">
                <SelectValue placeholder={t('form.areaPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {areas.map((area) => (
                  <SelectItem key={area.id} value={area.id}>
                    {area.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="rotation-description">{t('form.description')}</Label>
          <Textarea
            id="rotation-description"
            value={description}
            onChange={(e) => dispatch({ type: 'SET_DESCRIPTION', payload: e.target.value })}
            placeholder={t('form.descriptionPlaceholder')}
            maxLength={500}
            rows={2}
            disabled={isPending}
            className="resize-none"
          />
        </div>

        <div className="border-t" />

        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium">{t('steps.title')}</p>
            <p className="text-muted-foreground text-xs">{t('steps.description')}</p>
          </div>

          <div className="space-y-2">
            {steps.map((step, index) => (
              <StepRow
                key={step._key}
                step={step}
                index={index}
                stepsLength={steps.length}
                areaId={areaId}
                loadingShiftTypes={loadingShiftTypes}
                shiftTypes={shiftTypes}
                isPending={isPending}
                t={t}
                onToggleRest={onStepToggleRest}
                onShiftType={onStepShiftType}
                onMove={onMoveStep}
                onRemove={onRemoveStep}
              />
            ))}
          </div>

          {steps.length < 8 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onAddStep}
              disabled={isPending}
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" aria-hidden />
              {t('steps.addStep')}
            </Button>
          )}
        </div>

        {usedShiftTypeIds.length > 0 && (
          <>
            <div className="border-t" />
            <div className="space-y-3">
              <p className="text-sm font-medium">{t('form.shiftConfigsTitle')}</p>
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
                      <Label
                        htmlFor={`config-time-${stId}`}
                        className="min-w-0 flex-1 truncate text-sm"
                      >
                        {st.name}
                      </Label>
                      <Input
                        id={`config-time-${stId}`}
                        type="time"
                        value={shiftConfigs[stId] ?? ''}
                        onChange={(e) => onConfigTime(stId, e.target.value)}
                        className="w-32 shrink-0"
                        disabled={isPending}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}

        <div className="border-t" />

        <div className="space-y-3">
          <p className="text-sm font-medium">{t('form.groupsTitle')}</p>
          <div className="space-y-2">
            {groups.map((group, index) => (
              <GroupEditor
                key={group._key}
                group={group}
                index={index}
                groupsLength={groups.length}
                isPending={isPending}
                t={t}
                onNameChange={onGroupNameChange}
                onColorChange={onGroupColorChange}
                onIconChange={onGroupIconChange}
                onRemove={onRemoveGroup}
              />
            ))}
          </div>

          {groups.length < 6 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onAddGroup}
              disabled={isPending}
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" aria-hidden />
              {t('form.addGroup')}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export function RotationFormDialog({
  open,
  onOpenChange,
  areas,
  onCreated,
}: RotationFormDialogProps) {
  const t = useTranslations('rotations')
  const [isPending, startTransition] = useTransition()
  const [state, dispatch] = useReducer(formReducer, undefined, makeInitialState)

  const { name, description, areaId, steps, groups, shiftConfigs } = state

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) dispatch({ type: 'RESET' })
    onOpenChange(isOpen)
  }

  const handleAreaChange = (value: string) => {
    dispatch({ type: 'SET_AREA', payload: value })
    dispatch({ type: 'SET_SHIFT_TYPES', payload: [] })
    dispatch({ type: 'SET_SHIFT_CONFIGS', payload: {} })
    dispatch({
      type: 'SET_STEPS',
      payload: steps.map((s) => ({ _key: s._key, isRestDay: s.isRestDay })),
    })
    dispatch({ type: 'SET_LOADING_SHIFT_TYPES', payload: true })
    getShiftTypesAction()
      .then((result) => {
        if (result.success && result.data) {
          const areaTypes = result.data.filter(
            (st) =>
              st.isGlobal ||
              st.areaShiftTypes?.some((ast) => ast.areaId === value)
          )
          dispatch({
            type: 'SET_SHIFT_TYPES',
            payload: areaTypes.map((st) => ({ id: st.id, name: st.name, color: st.color })),
          })
        }
      })
      .finally(() => dispatch({ type: 'SET_LOADING_SHIFT_TYPES', payload: false }))
  }

  const usedShiftTypeIds = Array.from(
    new Set(
      steps
        .filter((s) => !s.isRestDay && s.shiftTypeId)
        .map((s) => s.shiftTypeId as string)
    )
  )

  const handleStepToggleRest = (index: number, checked: boolean) => {
    const s = steps[index]
    dispatch({
      type: 'UPDATE_STEP',
      index,
      step: { _key: s._key, isRestDay: checked, shiftTypeId: undefined },
    })
  }

  const handleStepShiftType = (index: number, value: string) => {
    const s = steps[index]
    dispatch({ type: 'UPDATE_STEP', index, step: { ...s, shiftTypeId: value } })
  }

  const handleMoveStep = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1
    dispatch({ type: 'SWAP_STEPS', indexA: index, indexB: target })
  }

  const handleRemoveStep = (index: number) => {
    dispatch({ type: 'REMOVE_STEP', index })
  }

  const handleAddStep = () => {
    dispatch({ type: 'ADD_STEP' })
  }

  const handleGroupNameChange = (index: number, value: string) => {
    dispatch({ type: 'UPDATE_GROUP', index, group: { ...groups[index], name: value } })
  }

  const handleGroupColorChange = (index: number, value: string) => {
    dispatch({ type: 'UPDATE_GROUP', index, group: { ...groups[index], color: value } })
  }

  const handleGroupIconChange = (index: number, value: string) => {
    dispatch({ type: 'UPDATE_GROUP', index, group: { ...groups[index], icon: value } })
  }

  const handleRemoveGroup = (index: number) => {
    dispatch({ type: 'REMOVE_GROUP', index })
  }

  const handleAddGroup = () => {
    dispatch({ type: 'ADD_GROUP' })
  }

  const handleConfigTime = (shiftTypeId: string, value: string) => {
    dispatch({ type: 'SET_CONFIG_TIME', shiftTypeId, value })
  }

  const isValid = (() => {
    if (!name.trim() || !areaId) return false
    if (steps.length < 2) return false
    const hasInvalidStep = steps.some((s) => !s.isRestDay && !s.shiftTypeId)
    if (hasInvalidStep) return false
    const missingConfig = usedShiftTypeIds.some(
      (id) => !shiftConfigs[id] || !isValidTime(shiftConfigs[id])
    )
    if (missingConfig) return false
    if (groups.length < 2) return false
    const hasEmptyGroup = groups.some((g) => !g.name.trim())
    if (hasEmptyGroup) return false
    return true
  })()

  const handleSubmit = () => {
    if (!isValid || isPending) return

    const submitData = {
      name: name.trim(),
      description: description.trim() || undefined,
      areaId,
      steps: steps.map((s, i) => ({
        order: i,
        isRestDay: s.isRestDay,
        shiftTypeId: s.isRestDay ? undefined : s.shiftTypeId,
      })),
      shiftConfigs: Object.entries(shiftConfigs).map(([shiftTypeId, startTime]) => ({
        shiftTypeId,
        startTime,
      })),
      groups: groups.map((g) => ({ name: g.name, color: g.color, icon: g.icon })),
    }

    startTransition(async () => {
      const result = await createRotationAction(submitData)
      if (result.success) {
        toast.success(t('form.created'))
        onCreated()
      } else
        toast.error(result.error ?? t('loadError'))
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>{t('form.createTitle')}</DialogTitle>
          <DialogDescription>{t('form.createDescription')}</DialogDescription>
        </DialogHeader>

        <RotationFormBody
          state={state}
          areas={areas}
          usedShiftTypeIds={usedShiftTypeIds}
          isPending={isPending}
          dispatch={dispatch}
          t={t}
          onAreaChange={handleAreaChange}
          onStepToggleRest={handleStepToggleRest}
          onStepShiftType={handleStepShiftType}
          onMoveStep={handleMoveStep}
          onRemoveStep={handleRemoveStep}
          onAddStep={handleAddStep}
          onConfigTime={handleConfigTime}
          onGroupNameChange={handleGroupNameChange}
          onGroupColorChange={handleGroupColorChange}
          onGroupIconChange={handleGroupIconChange}
          onRemoveGroup={handleRemoveGroup}
          onAddGroup={handleAddGroup}
        />

        <DialogFooter className="mt-4 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isPending}
          >
            {t('form.cancel')}
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!isValid || isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                {t('form.creating')}
              </>
            ) : (
              t('form.create')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
