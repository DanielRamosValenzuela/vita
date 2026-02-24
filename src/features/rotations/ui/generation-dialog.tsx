'use client'

import { Dispatch, useMemo, useReducer, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { CalendarPlus, Eye, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/src/shared/ui/badge'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/shared/ui/table'
import { ProcessingOverlay } from '@/src/shared/ui/atoms/processing-overlay'

import { generateShiftsAction, previewGenerationAction, regenerateShiftsAction } from '../api/generation-actions'
import type { GenerationPreview } from '../types/rotation-types'

interface GenerationDialogProps {
  rotationId: string
  rotationName: string
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

const initialState: GenState = {
  startDate: undefined,
  endDate: undefined,
  preview: null,
  overrideConflicts: false,
  replaceExisting: false,
  step: 'dates',
  pendingOp: 'none',
  generateComplete: false,
}

function genReducer(state: GenState, action: GenAction): GenState {
  switch (action.type) {
    case 'RESET':
      return initialState
    case 'SET_START_DATE':
      return { ...state, startDate: action.payload }
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
    default:
      return state
  }
}

type TranslationFn = ReturnType<typeof useTranslations<'rotations'>>

interface DateStepContentProps {
  state: GenState
  dispatch: Dispatch<GenAction>
  isPending: boolean
  t: TranslationFn
}

function DateStepContent({ state, dispatch, t }: DateStepContentProps) {
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm">{t('generation.selectDates')}</p>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="gen-start-date">{t('generation.startDate')}</Label>
          <Input
            id="gen-start-date"
            type="date"
            value={state.startDate ? state.startDate.toISOString().split('T')[0] : ''}
            onChange={(e) =>
              dispatch({ type: 'SET_START_DATE', payload: e.target.value ? new Date(e.target.value) : undefined })
            }
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="gen-end-date">{t('generation.endDate')}</Label>
          <Input
            id="gen-end-date"
            type="date"
            value={state.endDate ? state.endDate.toISOString().split('T')[0] : ''}
            onChange={(e) =>
              dispatch({ type: 'SET_END_DATE', payload: e.target.value ? new Date(e.target.value) : undefined })
            }
          />
        </div>
      </div>
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

function PreviewStepContent({ state, dispatch, preview, regenerateMode, t }: PreviewStepContentProps) {
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
                      <TableCell>
                        {conflict.date.toLocaleDateString()}
                      </TableCell>
                      <TableCell>{conflict.existingShift.shiftType}</TableCell>
                    </TableRow>
                  ))}
                  {preview.conflicts.length > 5 && (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-muted-foreground text-center text-xs"
                      >
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
  open,
  onOpenChange,
  onGenerated,
  regenerateMode,
}: GenerationDialogProps) {
  const t = useTranslations('rotations')
  const [state, dispatch] = useReducer(genReducer, initialState)
  const [isPending, startTransition] = useTransition()

  const previewMessages = useMemo(() => [
    t('generation.processingPreviewMsg1'),
    t('generation.processingPreviewMsg2'),
    t('generation.processingPreviewMsg3'),
  ], [t])

  const generateMessages = useMemo(() => [
    t('generation.processingGenerateMsg1'),
    t('generation.processingGenerateMsg2'),
    t('generation.processingGenerateMsg3'),
    t('generation.processingGenerateMsg4'),
  ], [t])

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
      })

      dispatch({ type: 'SET_PENDING_OP', payload: 'none' })
      if (result.success && result.data) {
        dispatch({ type: 'SET_PREVIEW', payload: result.data })
        dispatch({ type: 'SET_STEP', payload: 'preview' })
      } else
        toast.error(result.error ?? t('loadError'))
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
        })
      else
        result = await generateShiftsAction({
          rotationId,
          startDate: state.startDate!,
          endDate: state.endDate!,
          overrideConflicts: state.overrideConflicts,
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
            regenerateMode
              ? <RefreshCw className="h-6 w-6" aria-hidden />
              : <CalendarPlus className="h-6 w-6" aria-hidden />
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
              <Button
                onClick={handlePreview}
                disabled={!canPreview || isPending}
                className="gap-2"
              >
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
                disabled={isPending || (!regenerateMode && (state.preview?.conflicts?.length ?? 0) > 0 && !state.overrideConflicts)}
                className="gap-2"
              >
                {regenerateMode
                  ? t('generation.regenerateButton')
                  : t('generation.generateButton')}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
