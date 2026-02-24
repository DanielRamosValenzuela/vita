'use client'

import { useCallback, useState, useTransition } from 'react'
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
  isRestDay: boolean
  shiftTypeId?: string
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

export function RotationDetailContent({
  initialRotation,
}: RotationDetailContentProps) {
  const t = useTranslations('rotations')
  const router = useRouter()
  const [rotation, setRotation] = useState<RotationWithRelations>(initialRotation)
  const [deleteDialogState, setDeleteDialogState] = useState<DeleteDialogState>('none')
  const [generationOpen, setGenerationOpen] = useState(false)
  const [regenerateOpen, setRegenerateOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const [editingConfigs, setEditingConfigs] = useState(false)
  const [configTimes, setConfigTimes] = useState<Record<string, string>>({})

  const [editingPattern, setEditingPattern] = useState(false)
  const [editSteps, setEditSteps] = useState<EditableStep[]>([])
  const [editShiftConfigs, setEditShiftConfigs] = useState<Record<string, string>>({})
  const [shiftTypes, setShiftTypes] = useState<ShiftTypeOption[]>([])
  const [loadingShiftTypes, setLoadingShiftTypes] = useState(false)

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
        setDeleteDialogState('none')
        router.push('/dashboard/rotations')
      } else
        toast.error(result.error ?? t('loadError'))
    })
  }

  const startEditConfigs = () => {
    const times: Record<string, string> = {}
    for (const cfg of rotation.shiftConfigs)
      times[cfg.shiftTypeId] = cfg.startTime
    setConfigTimes(times)
    setEditingConfigs(true)
  }

  const handleSaveConfigs = () => {
    const shiftConfigs = Object.entries(configTimes).map(([shiftTypeId, startTime]) => ({
      shiftTypeId,
      startTime,
    }))

    startTransition(async () => {
      const result = await updateRotationAction(rotation.id, { shiftConfigs })

      if (result.success) {
        toast.success(t('detail.configsSaved'))
        if (result.data) setRotation(result.data)
        setEditingConfigs(false)
      } else
        toast.error(result.error ?? t('loadError'))
    })
  }

  const startEditPattern = () => {
    if (!canEditPattern) return

    setEditSteps(
      rotation.steps.map((s) => ({
        isRestDay: s.isRestDay,
        shiftTypeId: s.shiftType?.id,
      }))
    )

    const configs: Record<string, string> = {}
    for (const cfg of rotation.shiftConfigs)
      configs[cfg.shiftTypeId] = cfg.startTime
    setEditShiftConfigs(configs)

    setLoadingShiftTypes(true)
    getShiftTypesAction()
      .then((result) => {
        if (result.success && result.data) {
          const areaTypes = result.data.filter(
            (st) =>
              st.isGlobal ||
              st.areaShiftTypes?.some((ast) => ast.areaId === rotation.areaId)
          )
          setShiftTypes(
            areaTypes.map((st) => ({ id: st.id, name: st.name, color: st.color }))
          )
        }
      })
      .finally(() => setLoadingShiftTypes(false))

    setEditingPattern(true)
  }

  const handleStepToggleRest = (index: number, checked: boolean) => {
    setEditSteps((prev) =>
      prev.map((s, i) =>
        i === index ? { isRestDay: checked, shiftTypeId: undefined } : s
      )
    )
  }

  const handleStepShiftType = (index: number, value: string) => {
    setEditSteps((prev) =>
      prev.map((s, i) => (i === index ? { ...s, shiftTypeId: value } : s))
    )
  }

  const handleMoveStep = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1
    if (target < 0 || target >= editSteps.length) return
    setEditSteps((prev) => {
      const next = [...prev]
      const temp = next[index]
      next[index] = next[target]
      next[target] = temp
      return next
    })
  }

  const handleRemoveStep = (index: number) => {
    if (editSteps.length <= 2) return
    setEditSteps((prev) => prev.filter((_, i) => i !== index))
  }

  const handleAddStep = () => {
    if (editSteps.length >= 8) return
    setEditSteps((prev) => [...prev, { isRestDay: false }])
  }

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

  const handleSavePattern = () => {
    if (!isPatternValid) return

    const steps = editSteps.map((s, i) => ({
      order: i,
      isRestDay: s.isRestDay,
      shiftTypeId: s.isRestDay ? undefined : s.shiftTypeId,
    }))

    const shiftConfigs = usedShiftTypeIds.map((shiftTypeId) => ({
      shiftTypeId,
      startTime: editShiftConfigs[shiftTypeId],
    }))

    startTransition(async () => {
      const result = await updateRotationAction(rotation.id, { steps, shiftConfigs })

      if (result.success) {
        toast.success(t('detail.patternSaved'))
        if (result.data) setRotation(result.data)
        setEditingPattern(false)
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
              {!editingPattern && (
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
            {editingPattern ? (
              <div className="space-y-3">
                <div className="space-y-2">
                  {editSteps.map((step, index) => (
                    <div
                      key={index}
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
                              onChange={(e) =>
                                setEditShiftConfigs((prev) => ({
                                  ...prev,
                                  [stId]: e.target.value,
                                }))
                              }
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
                    onClick={() => setEditingPattern(false)}
                    disabled={isPending}
                  >
                    {t('form.cancel')}
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSavePattern}
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
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {rotation.steps.map((step) => (
                  <PatternStep key={step.id} step={step} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {(rotation.shiftConfigs.length > 0 && !editingPattern) && (
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
                        onClick={startEditConfigs}
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
                    {rotation.shiftConfigs.map((cfg) => (
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
                                setConfigTimes((prev) => ({
                                  ...prev,
                                  [cfg.shiftTypeId]: e.target.value,
                                }))
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
                    onClick={() => setEditingConfigs(false)}
                    disabled={isPending}
                  >
                    {t('form.cancel')}
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveConfigs}
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

      <GenerationDialog
        rotationId={rotation.id}
        rotationName={rotation.name}
        open={generationOpen}
        onOpenChange={setGenerationOpen}
        onGenerated={handleMemberChanged}
      />
      <GenerationDialog
        rotationId={rotation.id}
        rotationName={rotation.name}
        open={regenerateOpen}
        onOpenChange={setRegenerateOpen}
        onGenerated={handleMemberChanged}
        regenerateMode
      />
    </>
  )
}
