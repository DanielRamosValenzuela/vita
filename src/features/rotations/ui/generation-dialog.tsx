'use client'

import { useMemo, useState, useTransition } from 'react'
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

export function GenerationDialog({
  rotationId,
  rotationName,
  open,
  onOpenChange,
  onGenerated,
  regenerateMode,
}: GenerationDialogProps) {
  const t = useTranslations('rotations')
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [preview, setPreview] = useState<GenerationPreview | null>(null)
  const [overrideConflicts, setOverrideConflicts] = useState(false)
  const [replaceExisting, setReplaceExisting] = useState(false)
  const [step, setStep] = useState<Step>('dates')
  const [isPending, startTransition] = useTransition()
  const [pendingOp, setPendingOp] = useState<PendingOp>('none')
  const [generateComplete, setGenerateComplete] = useState(false)

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
    if (!isOpen) {
      setStartDate(undefined)
      setEndDate(undefined)
      setPreview(null)
      setOverrideConflicts(false)
      setReplaceExisting(false)
      setStep('dates')
      setPendingOp('none')
      setGenerateComplete(false)
    }
    onOpenChange(isOpen)
  }

  const handlePreview = () => {
    if (!startDate || !endDate) return

    setPendingOp('preview')
    startTransition(async () => {
      const result = await previewGenerationAction({
        rotationId,
        startDate,
        endDate,
      })

      setPendingOp('none')
      if (result.success && result.data) {
        setPreview(result.data)
        setStep('preview')
      } else
        toast.error(result.error ?? t('loadError'))
    })
  }

  const handleGenerate = () => {
    if (!startDate || !endDate || !preview) return

    setPendingOp('generate')
    setGenerateComplete(false)
    startTransition(async () => {
      let result
      if (regenerateMode)
        result = await regenerateShiftsAction({
          rotationId,
          startDate,
          endDate,
          replaceExisting,
        })
      else
        result = await generateShiftsAction({
          rotationId,
          startDate,
          endDate,
          overrideConflicts,
        })

      if (result.success) {
        setGenerateComplete(true)
        toast.success(t('generation.shiftsCreated', { count: result.data?.shiftsCreated ?? 0 }))
      } else {
        setPendingOp('none')
        toast.error(result.error ?? t('loadError'))
      }
    })
  }

  const handleGenerateAnimationComplete = () => {
    setPendingOp('none')
    setGenerateComplete(false)
    onGenerated()
    onOpenChange(false)
  }

  const canPreview = !!startDate && !!endDate && startDate <= endDate

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg overflow-hidden">
        <ProcessingOverlay
          isActive={pendingOp === 'preview'}
          icon={<Eye className="h-6 w-6" aria-hidden />}
          title={t('generation.processingPreviewTitle')}
          messages={previewMessages}
        />

        <ProcessingOverlay
          isActive={pendingOp === 'generate'}
          icon={
            regenerateMode
              ? <RefreshCw className="h-6 w-6" aria-hidden />
              : <CalendarPlus className="h-6 w-6" aria-hidden />
          }
          title={t('generation.processingGenerateTitle')}
          messages={generateMessages}
          isComplete={generateComplete}
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

        {step === 'dates' && (
          <div className="space-y-4">
            <p className="text-muted-foreground text-sm">{t('generation.selectDates')}</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="gen-start-date">{t('generation.startDate')}</Label>
                <Input
                  id="gen-start-date"
                  type="date"
                  value={startDate ? startDate.toISOString().split('T')[0] : ''}
                  onChange={(e) =>
                    setStartDate(e.target.value ? new Date(e.target.value) : undefined)
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="gen-end-date">{t('generation.endDate')}</Label>
                <Input
                  id="gen-end-date"
                  type="date"
                  value={endDate ? endDate.toISOString().split('T')[0] : ''}
                  onChange={(e) =>
                    setEndDate(e.target.value ? new Date(e.target.value) : undefined)
                  }
                />
              </div>
            </div>
          </div>
        )}

        {step === 'preview' && preview && (
          <div className="space-y-4">
            {regenerateMode && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="replace-existing"
                    checked={replaceExisting}
                    onCheckedChange={(checked) => setReplaceExisting(checked === true)}
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
                        {preview.conflicts.slice(0, 5).map((conflict, idx) => (
                          <TableRow key={idx}>
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
                        checked={overrideConflicts}
                        onCheckedChange={(checked) =>
                          setOverrideConflicts(checked === true)
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
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          {step === 'dates' && (
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

          {step === 'preview' && (
            <>
              <Button
                variant="outline"
                onClick={() => setStep('dates')}
                disabled={isPending}
              >
                {t('form.cancel')}
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={isPending || (!regenerateMode && (preview?.conflicts?.length ?? 0) > 0 && !overrideConflicts)}
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
