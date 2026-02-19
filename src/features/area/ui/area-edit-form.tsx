'use client'

import { useMemo, useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { ArrowLeft, Info, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { AREA_ICONS } from '@/src/shared/lib/constants'
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/shared/ui/card'
import { IconDisplay, IconPicker } from '@/src/shared/ui/icon-picker'
import { Input } from '@/src/shared/ui/input'
import { Label } from '@/src/shared/ui/label'
import { SearchableAddableList } from '@/src/shared/ui/molecules'
import { Switch } from '@/src/shared/ui/switch'
import { Textarea } from '@/src/shared/ui/textarea'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/src/shared/ui/tooltip'

import { useRouter } from '@/i18n/navigation'

import {
  assignChiefsToAreaAction,
  assignShiftTypesToAreaAction,
  assignStaffToAreaAction,
  setAreaActiveAction,
  updateAreaAction,
} from '../api'
import type { ChiefOption, StaffOption } from '../api/area-actions'

interface ShiftTypeOption {
  id: string
  name: string
  durationMinutes: number
  classification: string
  color: string
  icon?: string | null
}

interface AreaEditFormProps {
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

function formatDuration(mins: number) {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
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
  const tShifts = useTranslations('shifts.shiftTypes')
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState(area.name)
  const [description, setDescription] = useState(area.description || '')
  const [icon, setIcon] = useState(area.icon ?? 'Building2')
  const [color, setColor] = useState(area.color ?? '#3b82f6')
  const [isActive, setIsActive] = useState(area.isActive)
  const [maxConsecutiveHours, setMaxConsecutiveHours] = useState<string>(
    area.maxConsecutiveHours != null ? String(area.maxConsecutiveHours) : ''
  )
  const [minRestHours, setMinRestHours] = useState<string>(
    area.minRestHours != null ? String(area.minRestHours) : ''
  )
  const [dayStartTime, setDayStartTime] = useState<string>(area.dayStartTime ?? '')
  const [dayEndTime, setDayEndTime] = useState<string>(area.dayEndTime ?? '')
  const [selectedShiftTypeIds, setSelectedShiftTypeIds] = useState<Set<string>>(
    () => new Set(area.shiftTypes.filter((ast) => ast.isActive).map((ast) => ast.shiftType.id))
  )
  const [selectedChiefIds, setSelectedChiefIds] = useState<Set<string>>(
    () => new Set(initialAssignedChiefIds)
  )
  const [selectedStaffIds, setSelectedStaffIds] = useState<Set<string>>(
    () => new Set(initialAssignedStaffIds)
  )
  const [showSaveConfirm, setShowSaveConfirm] = useState(false)

  const initialSelectedIds = useMemo(
    () => new Set(area.shiftTypes.filter((ast) => ast.isActive).map((ast) => ast.shiftType.id)),
    [area.shiftTypes]
  )

  const assignedCount = selectedShiftTypeIds.size
  const canActivate = assignedCount > 0

  const hasChanges = useMemo(() => {
    if (name.trim() !== area.name) return true
    if ((description || '') !== (area.description || '')) return true
    if ((icon ?? 'Building2') !== (area.icon ?? 'Building2')) return true
    if ((color ?? '#3b82f6') !== (area.color ?? '#3b82f6')) return true
    if (isActive !== area.isActive) return true
    const maxStr = area.maxConsecutiveHours != null ? String(area.maxConsecutiveHours) : ''
    if (maxConsecutiveHours !== maxStr) return true
    const minStr = area.minRestHours != null ? String(area.minRestHours) : ''
    if (minRestHours !== minStr) return true
    if ((area.dayStartTime ?? '') !== dayStartTime) return true
    if ((area.dayEndTime ?? '') !== dayEndTime) return true
    if (selectedShiftTypeIds.size !== initialSelectedIds.size) return true
    if ([...selectedShiftTypeIds].some((id) => !initialSelectedIds.has(id))) return true
    if ([...initialSelectedIds].some((id) => !selectedShiftTypeIds.has(id))) return true
    if (canAssignChiefs) {
      if (selectedChiefIds.size !== initialAssignedChiefIds.size) return true
      if ([...selectedChiefIds].some((id) => !initialAssignedChiefIds.has(id))) return true
      if ([...initialAssignedChiefIds].some((id) => !selectedChiefIds.has(id))) return true
    }
    if (selectedStaffIds.size !== initialAssignedStaffIds.size) return true
    if ([...selectedStaffIds].some((id) => !initialAssignedStaffIds.has(id))) return true
    if ([...initialAssignedStaffIds].some((id) => !selectedStaffIds.has(id))) return true
    return false
  }, [
    name,
    description,
    icon,
    color,
    isActive,
    maxConsecutiveHours,
    minRestHours,
    selectedShiftTypeIds,
    initialSelectedIds,
    area.name,
    area.description,
    area.icon,
    area.color,
    area.isActive,
    area.maxConsecutiveHours,
    area.minRestHours,
    canAssignChiefs,
    selectedChiefIds,
    initialAssignedChiefIds,
    selectedStaffIds,
    initialAssignedStaffIds,
    area.dayStartTime,
    area.dayEndTime,
    dayStartTime,
    dayEndTime,
  ])

  const handleSelectionChange = (ids: Set<string>) => {
    setSelectedShiftTypeIds(ids)
  }

  const performSave = () => {
    if (!name.trim()) {
      toast.error(t('form.nameRequired'))
      return
    }

    startTransition(async () => {
      setShowSaveConfirm(false)

      const assignResult = await assignShiftTypesToAreaAction(
        area.id,
        Array.from(selectedShiftTypeIds)
      )
      if (!assignResult.success) {
        toast.error(assignResult.error)
        return
      }

      if (canAssignChiefs) {
        const chiefsResult = await assignChiefsToAreaAction(area.id, Array.from(selectedChiefIds))
        if (!chiefsResult.success) {
          toast.error(chiefsResult.error)
          return
        }
      }

      const staffResult = await assignStaffToAreaAction(area.id, Array.from(selectedStaffIds))
      if (!staffResult.success) {
        toast.error(staffResult.error)
        return
      }

      const updateResult = await updateAreaAction(area.id, {
        name: name.trim(),
        description: description || undefined,
        icon,
        color,
        maxConsecutiveHours: maxConsecutiveHours ? parseInt(maxConsecutiveHours, 10) || null : null,
        minRestHours: minRestHours ? parseInt(minRestHours, 10) || null : null,
        dayStartTime: dayStartTime || null,
        dayEndTime: dayEndTime || null,
      })
      if (!updateResult.success) {
        toast.error(updateResult.error)
        return
      }

      const targetActive = canActivate && isActive
      const setActiveResult = await setAreaActiveAction(area.id, targetActive)
      if (!setActiveResult.success) {
        toast.error(setActiveResult.error)
        return
      }

      toast.success(t('editSuccess'))
      router.push('/dashboard/areas')
    })
  }

  const handleSave = () => {
    if (!hasChanges) return
    setShowSaveConfirm(true)
  }

  const handleToggleActive = (checked: boolean) => {
    if (checked && !canActivate) return
    setIsActive(checked)
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/dashboard/areas">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('back')}
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{t('editForm.basicInfo')}</CardTitle>
          <CardDescription>{t('editForm.basicInfoDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">{t('form.name')}</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('form.namePlaceholder')}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">{t('form.description')}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('form.descriptionPlaceholder')}
              rows={3}
            />
          </div>
          <div className="grid gap-2">
            <Label>{t('form.icon')}</Label>
            <IconPicker
              value={icon}
              onChange={setIcon}
              icons={AREA_ICONS}
              ariaLabel={t('form.iconAria')}
              searchPlaceholder={t('form.iconSearch')}
              statusLabel={(showing, total, hasSearch) =>
                hasSearch
                  ? t('form.iconShowing', { showing, total })
                  : t('form.iconTotal', { total })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="areaColor">{t('form.color')}</Label>
            <div className="flex items-center gap-2">
              <input
                id="areaColor"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-10 w-20 cursor-pointer rounded-md border"
              />
              <Input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="font-mono text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('editForm.shiftTypes')}</CardTitle>
          <CardDescription>{t('editForm.shiftTypesDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          {shiftTypes.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t('editForm.noShiftTypes')}</p>
          ) : (
            <SearchableAddableList<ShiftTypeOption>
              items={shiftTypes}
              selectedIds={selectedShiftTypeIds}
              onSelectionChange={handleSelectionChange}
              getItemId={(st) => st.id}
              getSearchableText={(st) =>
                `${st.name} ${formatDuration(st.durationMinutes)} ${tShifts(`classification.${st.classification}`)}`
              }
              renderItem={(st) => (
                <span className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: st.color }}
                    aria-hidden
                  />
                  {st.icon && (
                    <span style={{ color: st.color }}><IconDisplay iconName={st.icon} size={16} /></span>
                  )}
                  <span className="font-medium">{st.name}</span>
                  <span className="text-muted-foreground text-sm">
                    {formatDuration(st.durationMinutes)} {t('editForm.separator')}{' '}
                    {tShifts(`classification.${st.classification}`)}
                  </span>
                </span>
              )}
              searchPlaceholder={t('editForm.shiftTypesSearch')}
              emptyMessage={t('editForm.allAssigned')}
              noResultsMessage={t('editForm.noMatch')}
              selectedLabel={t('editForm.assignedLabel')}
              removeItemAriaLabel={(st) => t('editForm.removeShiftType', { name: st.name })}
            />
          )}
          <p className="text-muted-foreground mt-4 text-sm">
            {t('editForm.assignedCount', { count: assignedCount })}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('editForm.chiefs')}</CardTitle>
          <CardDescription>{t('editForm.chiefsDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          {canAssignChiefs ? (
            chiefs.length === 0 ? (
              <p className="text-muted-foreground text-sm">{t('editForm.noChiefs')}</p>
            ) : (
              <SearchableAddableList<ChiefOption>
                items={chiefs}
                selectedIds={selectedChiefIds}
                onSelectionChange={setSelectedChiefIds}
                getItemId={(c) => c.id}
                getSearchableText={(c) => `${c.name} ${c.email} ${c.docNumber ?? ''}`.trim()}
                renderItem={(c) => (
                  <span className="flex flex-col gap-0.5">
                    <span className="font-medium">{c.name}</span>
                    <span className="text-muted-foreground text-sm">{c.email}</span>
                    {c.docNumber && (
                      <span className="text-muted-foreground text-xs">
                        {t('editForm.chiefDocNumber')}: {c.docNumber}
                      </span>
                    )}
                  </span>
                )}
                searchPlaceholder={t('editForm.chiefsSearch')}
                emptyMessage={t('editForm.noChiefs')}
                noResultsMessage={t('editForm.noMatch')}
                selectedLabel={t('editForm.assignedChiefsLabel')}
                removeItemAriaLabel={(c) => t('editForm.removeChief', { name: c.name })}
              />
            )
          ) : (
            <>
              <p className="text-muted-foreground mb-3 text-sm">
                {t('editForm.chiefsReadOnlyDescription')}
              </p>
              {chiefs.filter((c) => initialAssignedChiefIds.has(c.id)).length === 0 ? (
                <p className="text-muted-foreground text-sm">{t('editForm.noChiefsAssigned')}</p>
              ) : (
                <ul className="space-y-2" role="list">
                  {chiefs
                    .filter((c) => initialAssignedChiefIds.has(c.id))
                    .map((c) => (
                      <li
                        key={c.id}
                        className="flex flex-col gap-0.5 rounded-lg border bg-muted/30 px-3 py-2 text-sm"
                      >
                        <span className="font-medium">{c.name}</span>
                        <span className="text-muted-foreground text-xs">{c.email}</span>
                        {c.docNumber && (
                          <span className="text-muted-foreground text-xs">
                            {t('editForm.chiefDocNumber')}: {c.docNumber}
                          </span>
                        )}
                      </li>
                    ))}
                </ul>
              )}
            </>
          )}
          <p className="text-muted-foreground mt-4 text-sm">
            {t('editForm.chiefsAssignedCount', {
              count: canAssignChiefs ? selectedChiefIds.size : initialAssignedChiefIds.size,
            })}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('editForm.staff')}</CardTitle>
          <CardDescription>{t('editForm.staffDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          {staff.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t('editForm.noStaffInOrg')}</p>
          ) : (
            <SearchableAddableList<StaffOption>
              items={staff}
              selectedIds={selectedStaffIds}
              onSelectionChange={setSelectedStaffIds}
              getItemId={(s) => s.id}
              getSearchableText={(s) => `${s.name} ${s.email} ${s.docNumber ?? ''}`.trim()}
              renderItem={(s) => (
                <span className="flex flex-col gap-0.5">
                  <span className="font-medium">{s.name}</span>
                  <span className="text-muted-foreground text-sm">{s.email}</span>
                  {s.docNumber && (
                    <span className="text-muted-foreground text-xs">
                      {t('editForm.staffDocNumber')}: {s.docNumber}
                    </span>
                  )}
                </span>
              )}
              searchPlaceholder={t('editForm.staffSearch')}
              emptyMessage={t('editForm.noStaffInArea')}
              noResultsMessage={t('editForm.noMatch')}
              selectedLabel={t('editForm.assignedStaffLabel')}
              removeItemAriaLabel={(s) => t('editForm.removeStaff', { name: s.name })}
            />
          )}
          <p className="text-muted-foreground mt-4 text-sm">
            {t('editForm.staffAssignedCount', { count: selectedStaffIds.size })}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('editForm.workLimits')}</CardTitle>
          <CardDescription>{t('editForm.workLimitsDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="maxConsecutiveHours">{t('editForm.maxConsecutiveHours')}</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info
                      className="text-muted-foreground h-3.5 w-3.5 shrink-0 cursor-help"
                      aria-hidden
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    {t('editForm.maxConsecutiveHoursTooltip')}
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input
                id="maxConsecutiveHours"
                type="number"
                min={1}
                max={99}
                maxDigits={2}
                placeholder={t('editForm.maxConsecutiveHoursPlaceholder')}
                value={maxConsecutiveHours}
                onChange={(e) => setMaxConsecutiveHours(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="minRestHours">{t('editForm.minRestHours')}</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info
                      className="text-muted-foreground h-3.5 w-3.5 shrink-0 cursor-help"
                      aria-hidden
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    {t('editForm.minRestHoursTooltip')}
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input
                id="minRestHours"
                type="number"
                min={0}
                max={99}
                maxDigits={2}
                placeholder={t('editForm.minRestHoursPlaceholder')}
                value={minRestHours}
                onChange={(e) => setMinRestHours(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-3">
            <div className="flex items-center gap-1.5">
              <Label>{t('editForm.dayNightConfig')}</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info
                    className="text-muted-foreground h-3.5 w-3.5 shrink-0 cursor-help"
                    aria-hidden
                  />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  {t('editForm.dayNightConfigTooltip')}
                </TooltipContent>
              </Tooltip>
            </div>
            <p className="text-muted-foreground text-xs">{t('editForm.dayNightConfigHelper')}</p>
            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center">
              <div className="grid gap-1.5">
                <Label htmlFor="dayStartTime" className="text-xs sm:text-sm">
                  {t('editForm.dayStart')}
                </Label>
                <Input
                  id="dayStartTime"
                  type="time"
                  value={dayStartTime}
                  onChange={(e) => setDayStartTime(e.target.value)}
                />
              </div>
              <span className="hidden sm:flex items-center justify-center text-muted-foreground text-sm">
                {t('editForm.separator')}
              </span>
              <div className="grid gap-1.5">
                <Label htmlFor="dayEndTime" className="text-xs sm:text-sm">
                  {t('editForm.dayEnd')}
                </Label>
                <Input
                  id="dayEndTime"
                  type="time"
                  value={dayEndTime}
                  onChange={(e) => setDayEndTime(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('editForm.status')}</CardTitle>
              <CardDescription>
                {canActivate
                  ? t('editForm.statusDescription')
                  : t('editForm.statusDescriptionInactive')}
              </CardDescription>
            </div>
            <Switch
              checked={isActive}
              onCheckedChange={handleToggleActive}
              disabled={!canActivate}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Badge variant={isActive ? 'default' : 'secondary'}>
            {isActive ? t('status.active') : t('status.inactive')}
          </Badge>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button onClick={handleSave} disabled={!hasChanges || isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t('save')}
        </Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard/areas">{t('cancel')}</Link>
        </Button>
      </div>

      <AlertDialog open={showSaveConfirm} onOpenChange={setShowSaveConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('saveConfirm.title')}</AlertDialogTitle>
            <AlertDialogDescription>{t('saveConfirm.description')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>{t('saveConfirm.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={performSave} disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('saveConfirm.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
