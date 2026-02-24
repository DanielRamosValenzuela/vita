'use client'

import { useEffect, useState, useTransition } from 'react'
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
  isRestDay: boolean
  shiftTypeId?: string
}

interface Group {
  name: string
  color: string
  icon: string
}

interface ShiftTypeOption {
  id: string
  name: string
  color: string
}

function isValidTime(value: string): boolean {
  return /^\d{2}:\d{2}$/.test(value)
}

export function RotationFormDialog({
  open,
  onOpenChange,
  areas,
  onCreated,
}: RotationFormDialogProps) {
  const t = useTranslations('rotations')
  const [isPending, startTransition] = useTransition()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [areaId, setAreaId] = useState('')
  const [steps, setSteps] = useState<Step[]>([
    { isRestDay: false },
    { isRestDay: false },
  ])
  const [groups, setGroups] = useState<Group[]>([
    { name: 'A', color: '#3b82f6', icon: 'Users' },
    { name: 'B', color: '#10b981', icon: 'Users' },
  ])
  const [shiftConfigs, setShiftConfigs] = useState<Record<string, string>>({})
  const [shiftTypes, setShiftTypes] = useState<ShiftTypeOption[]>([])
  const [loadingShiftTypes, setLoadingShiftTypes] = useState(false)

  useEffect(() => {
    if (!open) {
      setName('')
      setDescription('')
      setAreaId('')
      setSteps([{ isRestDay: false }, { isRestDay: false }])
      setGroups([
        { name: 'A', color: '#3b82f6', icon: 'Users' },
        { name: 'B', color: '#10b981', icon: 'Users' },
      ])
      setShiftConfigs({})
      setShiftTypes([])
    }
  }, [open])

  const handleAreaChange = (value: string) => {
    setAreaId(value)
    setShiftTypes([])
    setShiftConfigs({})
    setSteps((prev) => prev.map((s) => ({ isRestDay: s.isRestDay })))
    setLoadingShiftTypes(true)
    getShiftTypesAction()
      .then((result) => {
        if (result.success && result.data) {
          const areaTypes = result.data.filter(
            (st) =>
              st.isGlobal ||
              st.areaShiftTypes?.some((ast) => ast.areaId === value)
          )
          setShiftTypes(
            areaTypes.map((st) => ({ id: st.id, name: st.name, color: st.color }))
          )
        }
      })
      .finally(() => setLoadingShiftTypes(false))
  }

  const usedShiftTypeIds = Array.from(
    new Set(
      steps
        .filter((s) => !s.isRestDay && s.shiftTypeId)
        .map((s) => s.shiftTypeId as string)
    )
  )

  const handleStepToggleRest = (index: number, checked: boolean) => {
    setSteps((prev) =>
      prev.map((s, i) =>
        i === index ? { isRestDay: checked, shiftTypeId: undefined } : s
      )
    )
  }

  const handleStepShiftType = (index: number, value: string) => {
    setSteps((prev) =>
      prev.map((s, i) => (i === index ? { ...s, shiftTypeId: value } : s))
    )
  }

  const handleMoveStep = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1
    if (target < 0 || target >= steps.length) return
    setSteps((prev) => {
      const next = [...prev]
      const temp = next[index]
      next[index] = next[target]
      next[target] = temp
      return next
    })
  }

  const handleRemoveStep = (index: number) => {
    if (steps.length <= 2) return
    setSteps((prev) => prev.filter((_, i) => i !== index))
  }

  const handleAddStep = () => {
    if (steps.length >= 8) return
    setSteps((prev) => [...prev, { isRestDay: false }])
  }

  const handleGroupNameChange = (index: number, value: string) => {
    setGroups((prev) => prev.map((g, i) => (i === index ? { ...g, name: value } : g)))
  }

  const handleGroupColorChange = (index: number, value: string) => {
    setGroups((prev) => prev.map((g, i) => (i === index ? { ...g, color: value } : g)))
  }

  const handleGroupIconChange = (index: number, value: string) => {
    setGroups((prev) => prev.map((g, i) => (i === index ? { ...g, icon: value } : g)))
  }

  const handleRemoveGroup = (index: number) => {
    if (groups.length <= 2) return
    setGroups((prev) => prev.filter((_, i) => i !== index))
  }

  const handleAddGroup = () => {
    if (groups.length >= 6) return
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const colorIndex = groups.length % PREDEFINED_COLORS.length
    setGroups((prev) => [
      ...prev,
      { name: letters[prev.length] ?? '', color: PREDEFINED_COLORS[colorIndex], icon: 'Users' },
    ])
  }

  const handleConfigTime = (shiftTypeId: string, value: string) => {
    setShiftConfigs((prev) => ({ ...prev, [shiftTypeId]: value }))
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>{t('form.createTitle')}</DialogTitle>
          <DialogDescription>{t('form.createDescription')}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-1">
          <div className="space-y-6 py-1">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="rotation-name">{t('form.name')}</Label>
                <Input
                  id="rotation-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('form.namePlaceholder')}
                  maxLength={100}
                  disabled={isPending}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rotation-area">{t('form.area')}</Label>
                <Select value={areaId} onValueChange={handleAreaChange} disabled={isPending}>
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
                onChange={(e) => setDescription(e.target.value)}
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
                  <div
                    key={index}
                    className="bg-muted/40 flex items-center gap-2 rounded-md border px-3 py-2"
                  >
                    <span className="text-muted-foreground w-14 shrink-0 text-xs">
                      {t('steps.day', { number: index + 1 })}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <Checkbox
                        id={`step-rest-${index}`}
                        checked={step.isRestDay}
                        onCheckedChange={(checked) =>
                          handleStepToggleRest(index, checked === true)
                        }
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
                        disabled={isPending || index === steps.length - 1}
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
                        disabled={isPending || steps.length <= 2}
                        aria-label={t('steps.removeStep')}
                      >
                        <X className="h-3 w-3" aria-hidden />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {steps.length < 8 && (
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
                            onChange={(e) => handleConfigTime(stId, e.target.value)}
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
                  <div key={index} className="space-y-2 rounded-lg border p-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-4 w-4 shrink-0 rounded-full"
                        style={{ backgroundColor: group.color }}
                        aria-hidden
                      />
                      <Input
                        value={group.name}
                        onChange={(e) => handleGroupNameChange(index, e.target.value)}
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
                            onChange={(v) => handleGroupIconChange(index, v)}
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
                        onClick={() => handleRemoveGroup(index)}
                        disabled={isPending || groups.length <= 2}
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
                          onClick={() => handleGroupColorChange(index, color)}
                          disabled={isPending}
                          aria-label={color}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {groups.length < 6 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddGroup}
                  disabled={isPending}
                >
                  <Plus className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                  {t('form.addGroup')}
                </Button>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
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
