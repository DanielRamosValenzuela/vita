'use client'

import { useEffect, useReducer, useTransition } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Calendar as CalendarIcon, CheckCircle2, Loader2, XCircle } from 'lucide-react'
import { toast } from 'sonner'

import { cn } from '@/src/shared/lib/utils'
import { formatDateLong } from '@/src/shared/lib/utils/format'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/shared/ui/table'

import {
  bulkGenerateShiftsAction,
  getActiveRotationsForBulkAction,
} from '../api/generation-actions'
import type { BulkGenerationResult, BulkRotationItem } from '../types/rotation-types'

interface MassGenerationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onGenerated: () => void
}

type Step = 'select' | 'results'

type RotationWithDays = BulkRotationItem & { daysRemaining: number | null }

interface MassGenState {
  rotations: RotationWithDays[]
  selectedIds: Set<string>
  startDate: Date | undefined
  endDate: Date | undefined
  step: Step
  loading: boolean
  results: BulkGenerationResult[]
}

type MassGenAction =
  | { type: 'SET_ROTATIONS'; payload: RotationWithDays[] }
  | { type: 'TOGGLE_ROTATION'; id: string }
  | { type: 'TOGGLE_ALL'; selected: boolean }
  | { type: 'SET_START_DATE'; payload: Date | undefined }
  | { type: 'SET_END_DATE'; payload: Date | undefined }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_RESULTS'; payload: BulkGenerationResult[] }
  | { type: 'RESET' }

function massGenReducer(state: MassGenState, action: MassGenAction): MassGenState {
  switch (action.type) {
    case 'SET_ROTATIONS': {
      const allIds = new Set(action.payload.map((r) => r.id))
      return { ...state, rotations: action.payload, selectedIds: allIds, loading: false }
    }
    case 'TOGGLE_ROTATION': {
      const next = new Set(state.selectedIds)
      if (next.has(action.id)) next.delete(action.id)
      else next.add(action.id)
      return { ...state, selectedIds: next }
    }
    case 'TOGGLE_ALL': {
      const next = action.selected ? new Set(state.rotations.map((r) => r.id)) : new Set<string>()
      return { ...state, selectedIds: next }
    }
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
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_RESULTS':
      return { ...state, results: action.payload, step: 'results', loading: false }
    case 'RESET':
      return {
        rotations: [],
        selectedIds: new Set(),
        startDate: undefined,
        endDate: undefined,
        step: 'select',
        loading: false,
        results: [],
      }
    default:
      return state
  }
}

const initialState: MassGenState = {
  rotations: [],
  selectedIds: new Set(),
  startDate: undefined,
  endDate: undefined,
  step: 'select',
  loading: true,
  results: [],
}

export function MassGenerationDialog({
  open,
  onOpenChange,
  onGenerated,
}: MassGenerationDialogProps) {
  const t = useTranslations('rotations')
  const locale = useLocale() as 'es' | 'en'
  const [state, dispatch] = useReducer(massGenReducer, initialState)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (!open) return
    dispatch({ type: 'RESET' })
    dispatch({ type: 'SET_LOADING', payload: true })
    getActiveRotationsForBulkAction().then((result) => {
      if (result.success && result.data) {
        const now = Date.now()
        const withDays = result.data.map((r) => ({
          ...r,
          daysRemaining: r.lastGeneratedDate
            ? Math.max(0, Math.ceil((new Date(r.lastGeneratedDate).getTime() - now) / (1000 * 60 * 60 * 24)))
            : null,
        }))
        dispatch({ type: 'SET_ROTATIONS', payload: withDays })
      }
      else {
        dispatch({ type: 'SET_LOADING', payload: false })
        toast.error(result.error ?? t('loadError'))
      }
    })
  }, [open, t])

  const handleOpenChange = (isOpen: boolean) => {
    if (isPending) return
    if (!isOpen) dispatch({ type: 'RESET' })
    onOpenChange(isOpen)
  }

  const handleGenerate = () => {
    if (!state.startDate || !state.endDate || state.selectedIds.size === 0) return

    dispatch({ type: 'SET_LOADING', payload: true })
    startTransition(async () => {
      const result = await bulkGenerateShiftsAction({
        rotationIds: Array.from(state.selectedIds),
        startDate: state.startDate!,
        endDate: state.endDate!,
      })

      if (result.success && result.data) {
        dispatch({ type: 'SET_RESULTS', payload: result.data })
        const totalCreated = result.data.reduce((sum, r) => sum + r.shiftsCreated, 0)
        toast.success(t('massGeneration.successSummary', { count: totalCreated }))
      } else {
        dispatch({ type: 'SET_LOADING', payload: false })
        toast.error(result.error ?? t('loadError'))
      }
    })
  }

  const handleClose = () => {
    if (state.step === 'results') onGenerated()
    handleOpenChange(false)
  }

  const allSelected =
    state.rotations.length > 0 && state.selectedIds.size === state.rotations.length
  const canGenerate =
    !!state.startDate &&
    !!state.endDate &&
    state.startDate <= state.endDate &&
    state.selectedIds.size > 0

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('massGeneration.title')}</DialogTitle>
          <DialogDescription>{t('massGeneration.description')}</DialogDescription>
        </DialogHeader>

        {state.loading && state.step === 'select' ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden />
          </div>
        ) : state.step === 'select' ? (
          <div className="space-y-4">
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
                      {state.startDate
                        ? formatDateLong(state.startDate, locale)
                        : t('generation.startDate')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={state.startDate}
                      defaultMonth={state.startDate}
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
                      {state.endDate
                        ? formatDateLong(state.endDate, locale)
                        : t('generation.endDate')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={state.endDate}
                      onSelect={(date) =>
                        dispatch({ type: 'SET_END_DATE', payload: date ?? undefined })
                      }
                      disabled={(date) => !!state.startDate && date < state.startDate}
                      defaultMonth={state.startDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>{t('massGeneration.selectRotations')}</Label>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="select-all"
                    checked={allSelected}
                    onCheckedChange={(checked) =>
                      dispatch({ type: 'TOGGLE_ALL', selected: checked === true })
                    }
                  />
                  <Label htmlFor="select-all" className="cursor-pointer text-xs text-muted-foreground">
                    {t('massGeneration.selectAll')}
                  </Label>
                </div>
              </div>

              {state.rotations.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  {t('massGeneration.noActiveRotations')}
                </p>
              ) : (
                <div className="max-h-64 overflow-y-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10" />
                        <TableHead>{t('list.columns.name')}</TableHead>
                        <TableHead>{t('list.columns.area')}</TableHead>
                        <TableHead className="text-center">{t('list.columns.members')}</TableHead>
                        <TableHead className="text-center">{t('list.columns.coverage')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {state.rotations.map((rotation) => {
                        const { daysRemaining } = rotation

                        return (
                          <TableRow key={rotation.id}>
                            <TableCell>
                              <Checkbox
                                checked={state.selectedIds.has(rotation.id)}
                                onCheckedChange={() =>
                                  dispatch({ type: 'TOGGLE_ROTATION', id: rotation.id })
                                }
                              />
                            </TableCell>
                            <TableCell className="font-medium">{rotation.name}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {rotation.areaName}
                            </TableCell>
                            <TableCell className="text-center">{rotation.memberCount}</TableCell>
                            <TableCell className="text-center">
                              {daysRemaining !== null ? (
                                <Badge
                                  variant={
                                    daysRemaining > 7
                                      ? 'secondary'
                                      : daysRemaining > 0
                                        ? 'outline'
                                        : 'destructive'
                                  }
                                >
                                  {daysRemaining > 0
                                    ? t('list.coverageDays', { days: daysRemaining })
                                    : t('list.noCoverage')}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground text-sm">-</span>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                {t('massGeneration.selectedCount', { count: state.selectedIds.size })}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('list.columns.name')}</TableHead>
                    <TableHead className="text-center">{t('massGeneration.created')}</TableHead>
                    <TableHead className="text-center">{t('massGeneration.skipped')}</TableHead>
                    <TableHead className="text-center">{t('massGeneration.status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {state.results.map((result) => (
                    <TableRow key={result.rotationId}>
                      <TableCell className="font-medium">{result.rotationName}</TableCell>
                      <TableCell className="text-center">{result.shiftsCreated}</TableCell>
                      <TableCell className="text-center">{result.shiftsSkipped}</TableCell>
                      <TableCell className="text-center">
                        {result.error ? (
                          <div className="flex items-center justify-center gap-1 text-destructive">
                            <XCircle className="h-4 w-4" aria-hidden />
                            <span className="text-xs">{t('massGeneration.error')}</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1 text-green-600">
                            <CheckCircle2 className="h-4 w-4" aria-hidden />
                            <span className="text-xs">{t('massGeneration.success')}</span>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <span>
                {t('massGeneration.totalCreated', {
                  count: state.results.reduce((sum, r) => sum + r.shiftsCreated, 0),
                })}
              </span>
              {state.results.some((r) => r.error) && (
                <Badge variant="destructive">
                  {t('massGeneration.errorsCount', {
                    count: state.results.filter((r) => r.error).length,
                  })}
                </Badge>
              )}
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          {state.step === 'select' ? (
            <>
              <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isPending}>
                {t('form.cancel')}
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={!canGenerate || isPending || state.loading}
                className="gap-2"
              >
                {state.loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
                {t('massGeneration.generateButton')}
              </Button>
            </>
          ) : (
            <Button onClick={handleClose}>{t('massGeneration.close')}</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
