'use client'

import { Dispatch, useEffect, useMemo, useReducer, useTransition } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Calendar as CalendarIcon, CalendarPlus, Eye, Info, Loader2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

import { cn } from '@/src/shared/lib/utils'
import { formatDateLong } from '@/src/shared/lib/utils/format'
import { ProcessingOverlay } from '@/src/shared/ui/atoms/processing-overlay'
import { Badge } from '@/src/shared/ui/badge'
import { Button } from '@/src/shared/ui/button'
import { Calendar } from '@/src/shared/ui/calendar'
import { Checkbox } from '@/src/shared/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/src/shared/ui/dialog'
import { Label } from '@/src/shared/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/src/shared/ui/popover'
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

import {
  generateShiftsAction,
  getLastGenerationInfoAction,
  previewGenerationAction,
  regenerateShiftsAction,
} from '../api/generation-actions'
import type { GenerationPreview, LastGenerationInfo } from '../types/rotation-types'

interface RotationGroup {
  id: string
  name: string
  color: string
  cycleOffset: number
}

interface GenerationDialogProps {
  rotationId: string
  rotationName: string
  groups: RotationGroup[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onGenerated: () => void
  regenerateMode?: boolean
}

type Step = 'dates' | 'preview'
type PendingOp = 'none' | 'preview' | 'generate'

type GenState = {
  startDate: Date | undefined
  endDate: Date | undefined
  preview: GenerationPreview | null
  overrideConflicts: boolean
  replaceExisting: boolean
  step: Step
  pendingOp: PendingOp
  generateComplete: boolean
  startingGroupId: string | undefined
  lastGenInfo: LastGenerationInfo | null
  loadingLastGen: boolean
}

type GenAction =
  | { type: 'RESET' }
  | { type: 'SET_START_DATE'; payload: Date | undefined }
  | { type: 'SET_END_DATE'; payload: Date | undefined }
  | { type: 'SET_PREVIEW'; payload: GenerationPreview }
  | { type: 'SET_OVERRIDE_CONFLICTS'; payload: boolean }
  | { type: 'SET_REPLACE_EXISTING'; payload: boolean }
  | { type: 'SET_STEP'; payload: Step }
  | { type: 'SET_PENDING_OP'; payload: PendingOp }
  | { type: 'SET_GENERATE_COMPLETE' }
  | { type: 'FINISH_GENERATE' }
  | { type: 'SET_STARTING_GROUP'; payload: string | undefined }
  | { type: 'SET_LAST_GEN_INFO'; payload: LastGenerationInfo | null }
  | { type: 'SET_LOADING_LAST_GEN'; payload: boolean }

const initialState: GenState = {
  startDate: undefined,
  endDate: undefined,
  preview: null,
  overrideConflicts: false,
  replaceExisting: false,
  step: 'dates',
  pendingOp: 'none',
  generateComplete: false,
  startingGroupId: undefined,
  lastGenInfo: null,
  loadingLastGen: false,
}

function genReducer(state: GenState, action: GenAction): GenState {
  switch (action.type) {
    case 'RESET':
      return initialState
    case 'SET_START_DATE':
      return {
        ...state,
        startDate: action.payload,
        endDate:
          action.payload && state.endDate && state.endDate < action.payload
            ? undefined
            : state.endDate,
      }
    case 'SET_END_DATE':
      return { ...state, endDate: action.payload }
    case 'SET_PREVIEW':
      return { ...state, preview: action.payload }
    case 'SET_OVERRIDE_CONFLICTS':
      return { ...state, overrideConflicts: action.payload }
    case 'SET_REPLACE_EXISTING':
      return { ...state, replaceExisting: action.payload }
    case 'SET_STEP':
      return { ...state, step: action.payload }
    case 'SET_PENDING_OP':
      return { ...state, pendingOp: action.payload }
    case 'SET_GENERATE_COMPLETE':
      return { ...state, generateComplete: true }
    case 'FINISH_GENERATE':
      return { ...state, pendingOp: 'none', generateComplete: false }
    case 'SET_STARTING_GROUP':
      return { ...state, startingGroupId: action.payload }
    case 'SET_LAST_GEN_INFO':
      return { ...state, lastGenInfo: action.payload }
    case 'SET_LOADING_LAST_GEN':
      return { ...state, loadingLastGen: action.payload }
    default:
      return state
  }
}

type TranslationFn = ReturnType<typeof useTranslations<'rotations'>>

interface DateStepContentProps {
  state: GenState
  dispatch: Dispatch<GenAction>
  isPending: boolean
  groups: RotationGroup[]
  locale: string
  t: TranslationFn
}

function DateStepContent({ state, dispatch, groups, locale, t }: DateStepContentProps) {
  const loc = locale as 'es' | 'en'

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm">{t('generation.selectDates')}</p>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>{t('generation.startDate')}</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !state.startDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" aria-hidden />
                {state.startDate ? formatDateLong(state.startDate, loc) : t('generation.startDate')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={state.startDate}
                onSelect={(date) =>
                  dispatch({ type: 'SET_START_DATE', payload: date ?? undefined })
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-1.5">
          <Label>{t('generation.endDate')}</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                disabled={!state.startDate}
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !state.endDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" aria-hidden />
                {state.endDate ? formatDateLong(state.endDate, loc) : t('generation.endDate')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={state.endDate}
                onSelect={(date) => dispatch({ type: 'SET_END_DATE', payload: date ?? undefined })}
                disabled={(date) => !!state.startDate && date < state.startDate}
                defaultMonth={state.startDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {!state.startDate && (
            <p className="text-muted-foreground text-xs">{t('generation.endDateDisabledHint')}</p>
          )}
        </div>
      </div>

      {state.loadingLastGen ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
        </div>
      ) : state.lastGenInfo ? (
        <div className="bg-muted/50 flex items-start gap-2 rounded-lg border p-3">
          <Info className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <div className="space-y-0.5">
            <p className="text-sm">
              {t('generation.lastGenerationInfo', {
                date: formatDateLong(state.lastGenInfo.lastDate, loc),
                group: state.lastGenInfo.lastGroupName,
                shiftType: state.lastGenInfo.lastShiftTypeName,
              })}
            </p>
            <p className="text-muted-foreground text-xs">
              {t('generation.totalGeneratedShifts', { count: state.lastGenInfo.totalShifts })}
            </p>
          </div>
        </div>
      ) : !state.loadingLastGen ? (
        <p className="text-muted-foreground text-xs">{t('generation.noExistingShifts')}</p>
      ) : null}

      {groups.length > 1 && (
        <div className="space-y-1.5">
          <Label>{t('generation.startingGroup')}</Label>
          <Select
            value={state.startingGroupId ?? '_default'}
            onValueChange={(v) =>
              dispatch({ type: 'SET_STARTING_GROUP', payload: v === '_default' ? undefined : v })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_default">{t('generation.defaultGroupOrder')}</SelectItem>
              {groups.map((g) => (
                <SelectItem key={g.id} value={g.id}>
                  <span className="flex items-center gap-1.5">
                    <span
                      className="inline-block h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: g.color }}
                      aria-hidden
                    />
                    {g.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-muted-foreground text-xs">{t('generation.startingGroupHint')}</p>
        </div>
      )}
    </div>
  )
}

interface PreviewStepContentProps {
  state: GenState
  dispatch: Dispatch<GenAction>
  preview: GenerationPreview
  regenerateMode?: boolean
  t: TranslationFn
}

function PreviewStepContent({
  state,
  dispatch,
  preview,
  regenerateMode,
  t,
}: PreviewStepContentProps) {
  return (
    <div className="space-y-4">
      {regenerateMode && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Checkbox
              id="replace-existing"
              checked={state.replaceExisting}
              onCheckedChange={(checked) =>
                dispatch({ type: 'SET_REPLACE_EXISTING', payload: checked === true })
              }
            />
            <Label htmlFor="replace-existing" className="cursor-pointer text-sm">
              {t('generation.replaceExistingShifts')}
            </Label>
          </div>
          <p className="text-muted-foreground pl-6 text-xs">
            {t('generation.preserveManualShifts')}
          </p>
        </div>
      )}

      <div className="bg-muted/50 rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{t('generation.shiftsToCreate')}</span>
          <Badge variant="default">{preview.totalShiftsToCreate}</Badge>
        </div>
        <p className="text-muted-foreground mt-1 text-xs">
          {t('generation.daysInRange', { count: preview.daysInRange })}
        </p>
      </div>

      {preview.shiftsPerGroup.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium">{t('generation.shiftsPerGroup')}</p>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('common.group')}</TableHead>
                  <TableHead className="text-right">{t('list.columns.shifts')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {preview.shiftsPerGroup.map((group) => (
                  <TableRow key={group.groupId}>
                    <TableCell className="font-medium">{group.groupName}</TableCell>
                    <TableCell className="text-right">{group.shiftCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <div>
        {preview.conflicts.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="destructive">
                {t('generation.conflictsFound', { count: preview.conflicts.length })}
              </Badge>
            </div>
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('common.member')}</TableHead>
                    <TableHead>{t('generation.startDate')}</TableHead>
                    <TableHead>{t('detail.shiftType')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preview.conflicts.slice(0, 5).map((conflict) => (
                    <TableRow key={`${conflict.userName}-${conflict.date.toISOString()}`}>
                      <TableCell className="font-medium">{conflict.userName}</TableCell>
                      <TableCell>{conflict.date.toLocaleDateString()}</TableCell>
                      <TableCell>{conflict.existingShift.shiftType}</TableCell>
                    </TableRow>
                  ))}
                  {preview.conflicts.length > 5 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-muted-foreground text-center text-xs">
                        {t('generation.conflictsFound', {
                          count: preview.conflicts.length - 5,
                        })}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            {!regenerateMode && (
              <div className="flex items-center gap-2">
                <Checkbox
                  id="override-conflicts"
                  checked={state.overrideConflicts}
                  onCheckedChange={(checked) =>
                    dispatch({ type: 'SET_OVERRIDE_CONFLICTS', payload: checked === true })
                  }
                />
                <Label htmlFor="override-conflicts" className="cursor-pointer text-sm">
                  {t('generation.overrideConflicts')}
                </Label>
              </div>
            )}
          </div>
        ) : (
          <Badge variant="secondary">{t('generation.noConflicts')}</Badge>
        )}
      </div>
    </div>
  )
}

export function GenerationDialog({
  rotationId,
  rotationName,
  groups,
  open,
  onOpenChange,
  onGenerated,
  regenerateMode,
}: GenerationDialogProps) {
  const t = useTranslations('rotations')
  const locale = useLocale()
  const [state, dispatch] = useReducer(genReducer, initialState)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (!open) return
    dispatch({ type: 'SET_LOADING_LAST_GEN', payload: true })
    getLastGenerationInfoAction(rotationId).then((result) => {
      if (result.success) {
        dispatch({ type: 'SET_LAST_GEN_INFO', payload: result.data ?? null })
        if (result.data) {
          const last = new Date(result.data.lastDate)
          const nextDay = new Date(
            Date.UTC(last.getUTCFullYear(), last.getUTCMonth(), last.getUTCDate() + 1)
          )
          dispatch({ type: 'SET_START_DATE', payload: nextDay })
        }
      }
      dispatch({ type: 'SET_LOADING_LAST_GEN', payload: false })
    })
  }, [open, rotationId])

  const previewMessages = useMemo(
    () => [
      t('generation.processingPreviewMsg1'),
      t('generation.processingPreviewMsg2'),
      t('generation.processingPreviewMsg3'),
    ],
    [t]
  )

  const generateMessages = useMemo(
    () => [
      t('generation.processingGenerateMsg1'),
      t('generation.processingGenerateMsg2'),
      t('generation.processingGenerateMsg3'),
      t('generation.processingGenerateMsg4'),
    ],
    [t]
  )

  const handleOpenChange = (isOpen: boolean) => {
    if (isPending) return
    if (!isOpen) dispatch({ type: 'RESET' })
    onOpenChange(isOpen)
  }

  const handlePreview = () => {
    if (!state.startDate || !state.endDate) return

    dispatch({ type: 'SET_PENDING_OP', payload: 'preview' })
    startTransition(async () => {
      const result = await previewGenerationAction({
        rotationId,
        startDate: state.startDate!,
        endDate: state.endDate!,
        startingGroupId: state.startingGroupId,
      })

      dispatch({ type: 'SET_PENDING_OP', payload: 'none' })
      if (result.success && result.data) {
        dispatch({ type: 'SET_PREVIEW', payload: result.data })
        dispatch({ type: 'SET_STEP', payload: 'preview' })
      } else toast.error(result.error ?? t('loadError'))
    })
  }

  const handleGenerate = () => {
    if (!state.startDate || !state.endDate || !state.preview) return

    dispatch({ type: 'SET_PENDING_OP', payload: 'generate' })
    startTransition(async () => {
      let result
      if (regenerateMode)
        result = await regenerateShiftsAction({
          rotationId,
          startDate: state.startDate!,
          endDate: state.endDate!,
          replaceExisting: state.replaceExisting,
          startingGroupId: state.startingGroupId,
        })
      else
        result = await generateShiftsAction({
          rotationId,
          startDate: state.startDate!,
          endDate: state.endDate!,
          overrideConflicts: state.overrideConflicts,
          startingGroupId: state.startingGroupId,
        })

      if (result.success) {
        dispatch({ type: 'SET_GENERATE_COMPLETE' })
        toast.success(t('generation.shiftsCreated', { count: result.data?.shiftsCreated ?? 0 }))
      } else {
        dispatch({ type: 'SET_PENDING_OP', payload: 'none' })
        toast.error(result.error ?? t('loadError'))
      }
    })
  }

  const handleGenerateAnimationComplete = () => {
    dispatch({ type: 'FINISH_GENERATE' })
    onGenerated()
    onOpenChange(false)
  }

  const canPreview = !!state.startDate && !!state.endDate && state.startDate <= state.endDate

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg overflow-hidden">
        <ProcessingOverlay
          isActive={state.pendingOp === 'preview'}
          icon={<Eye className="h-6 w-6" aria-hidden />}
          title={t('generation.processingPreviewTitle')}
          messages={previewMessages}
        />

        <ProcessingOverlay
          isActive={state.pendingOp === 'generate'}
          icon={
            regenerateMode ? (
              <RefreshCw className="h-6 w-6" aria-hidden />
            ) : (
              <CalendarPlus className="h-6 w-6" aria-hidden />
            )
          }
          title={t('generation.processingGenerateTitle')}
          messages={generateMessages}
          isComplete={state.generateComplete}
          onComplete={handleGenerateAnimationComplete}
        />

        <DialogHeader>
          <DialogTitle>
            {regenerateMode ? t('generation.regenerateMode') : t('generation.generateShifts')}
          </DialogTitle>
          <DialogDescription>
            {regenerateMode
              ? t('generation.regenerateDialogDescription', { name: rotationName })
              : t('generation.generateDialogDescription', { name: rotationName })}
          </DialogDescription>
        </DialogHeader>

        {state.step === 'dates' && (
          <DateStepContent
            state={state}
            dispatch={dispatch}
            isPending={isPending}
            groups={groups}
            locale={locale}
            t={t}
          />
        )}

        {state.step === 'preview' && state.preview && (
          <PreviewStepContent
            state={state}
            dispatch={dispatch}
            preview={state.preview}
            regenerateMode={regenerateMode}
            t={t}
          />
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          {state.step === 'dates' && (
            <>
              <Button
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isPending}
              >
                {t('form.cancel')}
              </Button>
              <Button onClick={handlePreview} disabled={!canPreview || isPending} className="gap-2">
                {t('generation.previewButton')}
              </Button>
            </>
          )}

          {state.step === 'preview' && (
            <>
              <Button
                variant="outline"
                onClick={() => dispatch({ type: 'SET_STEP', payload: 'dates' })}
                disabled={isPending}
              >
                {t('form.cancel')}
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={
                  isPending ||
                  (!regenerateMode &&
                    (state.preview?.conflicts?.length ?? 0) > 0 &&
                    !state.overrideConflicts)
                }
                className="gap-2"
              >
                {regenerateMode ? t('generation.regenerateButton') : t('generation.generateButton')}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
