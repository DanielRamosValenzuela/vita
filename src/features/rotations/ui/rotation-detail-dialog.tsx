'use client'

import { useCallback, useEffect, useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { CalendarPlus, Loader2, Power, PowerOff, RefreshCw, Trash2 } from 'lucide-react'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/src/shared/ui/dialog'
import { Skeleton } from '@/src/shared/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/shared/ui/table'

import {
  deleteRotationAction,
  getRotationAction,
  updateRotationAction,
} from '../api/rotation-actions'
import type { RotationWithRelations } from '../types/rotation-types'
import { CoverageOverview } from './coverage-overview'
import { GenerationDialog } from './generation-dialog'
import { RotationGroupsSection } from './rotation-groups-section'

interface RotationDetailDialogProps {
  rotationId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onRotationUpdated: () => void
}

type DeleteDialogState = 'none' | 'open'

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

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <div className="flex gap-2">
          <Skeleton className="h-7 w-16 rounded-full" />
          <Skeleton className="h-7 w-16 rounded-full" />
          <Skeleton className="h-7 w-16 rounded-full" />
          <Skeleton className="h-7 w-16 rounded-full" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-24 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    </div>
  )
}

export function RotationDetailDialog({
  rotationId,
  open,
  onOpenChange,
  onRotationUpdated,
}: RotationDetailDialogProps) {
  const t = useTranslations('rotations')
  const [rotation, setRotation] = useState<RotationWithRelations | null>(null)
  const [loading, setLoading] = useState(false)
  const [deleteDialogState, setDeleteDialogState] = useState<DeleteDialogState>('none')
  const [generationOpen, setGenerationOpen] = useState(false)
  const [regenerateOpen, setRegenerateOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const fetchRotation = useCallback(async (id: string) => {
    setLoading(true)
    const result = await getRotationAction(id)
    setLoading(false)

    if (result.success && result.data)
      setRotation(result.data)
    else
      toast.error(result.error ?? t('loadError'))
  }, [t])

  useEffect(() => {
    if (open && rotationId)
      fetchRotation(rotationId)
    else if (!open)
      setRotation(null)
  }, [open, rotationId, fetchRotation])

  const handleMemberChanged = () => {
    if (rotationId)
      fetchRotation(rotationId)
    onRotationUpdated()
  }

  const handleActivate = () => {
    if (!rotation) return

    startTransition(async () => {
      const result = await updateRotationAction(rotation.id, { status: 'ACTIVE' })

      if (result.success) {
        toast.success(t('detail.activateSuccess'))
        if (result.data) setRotation(result.data)
        onRotationUpdated()
      } else
        toast.error(result.error ?? t('loadError'))
    })
  }

  const handleDeactivate = () => {
    if (!rotation) return

    startTransition(async () => {
      const result = await updateRotationAction(rotation.id, { status: 'INACTIVE' })

      if (result.success) {
        toast.success(t('detail.deactivateSuccess'))
        if (result.data) setRotation(result.data)
        onRotationUpdated()
      } else
        toast.error(result.error ?? t('loadError'))
    })
  }

  const handleDelete = (deleteLinkedShifts: boolean) => {
    if (!rotation) return

    startTransition(async () => {
      const result = await deleteRotationAction(rotation.id, deleteLinkedShifts)

      if (result.success) {
        toast.success(t('detail.deleteSuccess'))
        setDeleteDialogState('none')
        onOpenChange(false)
        onRotationUpdated()
      } else
        toast.error(result.error ?? t('loadError'))
    })
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            {loading || !rotation ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            ) : (
              <div className="flex flex-wrap items-start gap-3">
                <div className="min-w-0 flex-1">
                  <DialogTitle>{rotation.name}</DialogTitle>
                  <DialogDescription>{rotation.area.name}</DialogDescription>
                </div>
                <Badge variant={getStatusVariant(rotation.status)}>
                  {t(`status.${rotation.status}`)}
                </Badge>
              </div>
            )}
          </DialogHeader>

          {loading ? (
            <DetailSkeleton />
          ) : rotation ? (
            <div className="space-y-8">
              <section aria-labelledby="detail-pattern-heading">
                <h3
                  id="detail-pattern-heading"
                  className="mb-3 text-sm font-semibold uppercase tracking-wide"
                >
                  {t('detail.patternTitle')}
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {rotation.steps.map((step) => (
                    <PatternStep key={step.id} step={step} />
                  ))}
                </div>
              </section>

              {rotation.shiftConfigs.length > 0 && (
                <section aria-labelledby="detail-configs-heading">
                  <h3
                    id="detail-configs-heading"
                    className="mb-3 text-sm font-semibold uppercase tracking-wide"
                  >
                    {t('detail.shiftConfigsTitle')}
                  </h3>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('detail.shiftType')}</TableHead>
                          <TableHead>{t('detail.startTime')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rotation.shiftConfigs.map((cfg) => (
                          <TableRow key={cfg.id}>
                            <TableCell className="font-medium">
                              {cfg.shiftType.name}
                            </TableCell>
                            <TableCell className="font-mono">{cfg.startTime}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </section>
              )}

              <section aria-labelledby="detail-groups-heading">
                <h3
                  id="detail-groups-heading"
                  className="mb-3 text-sm font-semibold uppercase tracking-wide"
                >
                  {t('common.groups')}
                </h3>
                <RotationGroupsSection
                  rotation={rotation}
                  onMemberChanged={handleMemberChanged}
                />
              </section>

              {rotation.status === 'ACTIVE' && (
                <section aria-labelledby="detail-coverage-heading">
                  <h3
                    id="detail-coverage-heading"
                    className="mb-3 text-sm font-semibold uppercase tracking-wide"
                  >
                    {t('coverage.coverageOverview')}
                  </h3>
                  <CoverageOverview rotationId={rotation.id} areaId={rotation.area.id} />
                </section>
              )}

              <footer className="flex flex-wrap items-center justify-end gap-2 border-t pt-4">
                {rotation.status === 'ACTIVE' ? (
                  <Button
                    variant="outline"
                    onClick={handleDeactivate}
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
                    onClick={handleActivate}
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
                      onClick={() => setRegenerateOpen(true)}
                      disabled={isPending}
                      className="gap-2"
                    >
                      <RefreshCw className="h-4 w-4" aria-hidden />
                      {t('form.regenerate')}
                    </Button>
                    <Button
                      variant="default"
                      onClick={() => setGenerationOpen(true)}
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
                  onClick={() => setDeleteDialogState('open')}
                  disabled={isPending}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                  {t('detail.delete')}
                </Button>
              </footer>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteDialogState === 'open'}
        onOpenChange={(isOpen) => {
          if (!isOpen) setDeleteDialogState('none')
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
              onClick={() => handleDelete(false)}
              disabled={isPending}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/80"
            >
              {t('detail.unlinkShifts')}
            </AlertDialogAction>
            <AlertDialogAction
              onClick={() => handleDelete(true)}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('detail.deleteShifts')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {rotation && (
        <GenerationDialog
          rotationId={rotation.id}
          rotationName={rotation.name}
          open={generationOpen}
          onOpenChange={setGenerationOpen}
          onGenerated={handleMemberChanged}
        />
      )}
      {rotation && (
        <GenerationDialog
          rotationId={rotation.id}
          rotationName={rotation.name}
          open={regenerateOpen}
          onOpenChange={setRegenerateOpen}
          onGenerated={handleMemberChanged}
          regenerateMode
        />
      )}
    </>
  )
}
