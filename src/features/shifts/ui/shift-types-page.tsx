'use client'

import { useMemo, useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { Check, Edit, Info, Loader2, Palette, Plus, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'

import { SHIFT_TYPE_ICONS } from '@/src/shared/lib/constants'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/src/shared/ui/dialog'
import { IconDisplay, IconPicker } from '@/src/shared/ui/icon-picker'
import { Input } from '@/src/shared/ui/input'
import { Label } from '@/src/shared/ui/label'
import { SearchableAddableList } from '@/src/shared/ui/molecules'
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

import { useRouter } from '@/i18n/navigation'

import {
  createShiftTypeAction,
  deleteShiftTypeAction,
  updateShiftTypeAction,
} from '../api/shift-type-actions'

const DEFAULT_SHIFT_TYPE_ICON = 'Clock'

type ShiftClassification = 'DAY' | 'NIGHT' | 'MIXED'

interface ShiftType {
  id: string
  name: string
  description?: string
  icon?: string | null
  durationMinutes: number
  classification: ShiftClassification
  color: string
  minStaffRequired: number
  idealStaffCount: number
  maxStaffAllowed: number
  isGlobal: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  _count?: {
    shifts: number
    areaShiftTypes?: number
  }
  areaShiftTypes?: Array<{
    areaId: string
    isActive: boolean
    area: { id: string; name: string }
  }>
}

interface AreaOption {
  id: string
  name: string
}

interface ShiftTypesPageProps {
  shiftTypes: ShiftType[]
  areas: AreaOption[]
}

export function ShiftTypesPage({ shiftTypes, areas }: ShiftTypesPageProps) {
  const t = useTranslations('shifts.shiftTypes')
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingShiftType, setEditingShiftType] = useState<ShiftType | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<ShiftType | null>(null)
  const [showSaveConfirm, setShowSaveConfirm] = useState(false)
  const [formData, setFormData] = useState<{
    name: string
    description: string
    icon: string
    durationHours: string
    durationMinutes: string
    classification: ShiftClassification
    color: string
    minStaffRequired: string
    idealStaffCount: string
    maxStaffAllowed: string
    isGlobal: boolean
    isActive: boolean
    areaConfigs: Array<{ areaId: string; isActive: boolean }>
  }>({
    name: '',
    description: '',
    icon: 'Clock',
    durationHours: '8',
    durationMinutes: '0',
    classification: 'DAY',
    color: '#3b82f6',
    minStaffRequired: '1',
    idealStaffCount: '1',
    maxStaffAllowed: '10',
    isGlobal: true,
    isActive: true,
    areaConfigs: [],
  })

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      icon: 'Clock',
      durationHours: '8',
      durationMinutes: '0',
      classification: 'DAY',
      color: '#3b82f6',
      minStaffRequired: '1',
      idealStaffCount: '1',
      maxStaffAllowed: '10',
      isGlobal: true,
      isActive: true,
      areaConfigs: [],
    })
    setEditingShiftType(null)
  }

  const handleCreate = () => {
    resetForm()
    setIsCreateDialogOpen(true)
  }

  const formatDuration = (mins: number) => {
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return m > 0 ? `${h}h ${m}min` : `${h}h`
  }

  const handleEdit = (shiftType: ShiftType) => {
    const h = Math.floor(shiftType.durationMinutes / 60)
    const m = shiftType.durationMinutes % 60
    const areaConfigs =
      shiftType.areaShiftTypes?.map((a) => ({
        areaId: a.areaId ?? a.area?.id ?? '',
        isActive: a.isActive ?? true,
      })) ?? []
    setFormData({
      name: shiftType.name,
      description: shiftType.description || '',
      icon: shiftType.icon ?? 'Clock',
      durationHours: String(h),
      durationMinutes: String(m),
      classification: shiftType.classification,
      color: shiftType.color,
      minStaffRequired: String(shiftType.minStaffRequired),
      idealStaffCount: String(shiftType.idealStaffCount),
      maxStaffAllowed: String(shiftType.maxStaffAllowed),
      isGlobal: shiftType.isGlobal,
      isActive: shiftType.isActive,
      areaConfigs,
    })
    setEditingShiftType(shiftType)
  }

  const hasChanges = useMemo(() => {
    if (editingShiftType) {
      const h = Math.floor(editingShiftType.durationMinutes / 60)
      const m = editingShiftType.durationMinutes % 60
      const initialAreaConfigs =
        editingShiftType.areaShiftTypes?.map((a) => ({
          areaId: a.areaId ?? a.area?.id ?? '',
          isActive: a.isActive ?? true,
        })) ?? []
      if (formData.name.trim() !== editingShiftType.name) return true
      if ((formData.description || '') !== (editingShiftType.description || '')) return true
      if ((formData.icon ?? 'Clock') !== (editingShiftType.icon ?? 'Clock')) return true
      if (formData.durationHours !== String(h) || formData.durationMinutes !== String(m))
        return true
      if (formData.classification !== editingShiftType.classification) return true
      if ((formData.color ?? '#3b82f6') !== editingShiftType.color) return true
      if (formData.minStaffRequired !== String(editingShiftType.minStaffRequired)) return true
      if (formData.idealStaffCount !== String(editingShiftType.idealStaffCount)) return true
      if (formData.maxStaffAllowed !== String(editingShiftType.maxStaffAllowed)) return true
      if (formData.isGlobal !== editingShiftType.isGlobal) return true
      if (formData.isActive !== editingShiftType.isActive) return true
      if (formData.areaConfigs.length !== initialAreaConfigs.length) return true
      const sameAreaConfigs =
        formData.areaConfigs.length === initialAreaConfigs.length &&
        formData.areaConfigs.every(
          (c, i) =>
            initialAreaConfigs[i]?.areaId === c.areaId &&
            initialAreaConfigs[i]?.isActive === c.isActive
        )
      if (!sameAreaConfigs) return true
      return false
    }
    return (
      formData.name.trim() !== '' ||
      (formData.description || '') !== '' ||
      formData.durationHours !== '8' ||
      formData.durationMinutes !== '0' ||
      formData.classification !== 'DAY' ||
      formData.color !== '#3b82f6' ||
      formData.minStaffRequired !== '1' ||
      formData.idealStaffCount !== '1' ||
      formData.maxStaffAllowed !== '10' ||
      formData.isGlobal !== true ||
      formData.isActive !== true ||
      formData.areaConfigs.length > 0
    )
  }, [formData, editingShiftType])

  const performSave = () => {
    if (!formData.name.trim()) {
      toast.error(t('form.nameRequired'))
      return
    }

    const durationMinutes =
      parseInt(formData.durationHours || '0', 10) * 60 +
      parseInt(formData.durationMinutes || '0', 10)
    if (durationMinutes < 30 || durationMinutes > 1440) {
      toast.error(t('form.durationInvalid'))
      return
    }

    if (!formData.isGlobal && formData.areaConfigs.length === 0) {
      toast.error(t('form.areasRequired'))
      return
    }

    const areaConfigs = formData.isGlobal ? undefined : formData.areaConfigs

    const payload = {
      name: formData.name.trim(),
      description: formData.description || undefined,
      icon: formData.icon,
      durationMinutes,
      classification: formData.classification,
      color: formData.color,
      minStaffRequired: parseInt(formData.minStaffRequired, 10) || 1,
      idealStaffCount: parseInt(formData.idealStaffCount, 10) || 1,
      maxStaffAllowed: parseInt(formData.maxStaffAllowed, 10) || 10,
      suggestedRestDays: 1,
      isGlobal: formData.isGlobal,
      isActive: formData.isActive,
      areaConfigs,
    }

    startTransition(async () => {
      setShowSaveConfirm(false)
      let result
      if (editingShiftType) result = await updateShiftTypeAction(editingShiftType.id, payload)
      else result = await createShiftTypeAction(payload)

      if (result.success) {
        toast.success(editingShiftType ? t('toast.updated') : t('toast.created'))
        setIsCreateDialogOpen(false)
        resetForm()
        router.push('/dashboard/shift-types')
      } else toast.error(result.error || t('toast.error'))
    })
  }

  const handleSave = () => {
    if (!hasChanges) return
    setShowSaveConfirm(true)
  }

  const handleDelete = (shiftType: ShiftType) => {
    setDeleteTarget(shiftType)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (!deleteTarget) return

    startTransition(async () => {
      const result = await deleteShiftTypeAction(deleteTarget.id)

      if (result.success) {
        toast.success(t('toast.deleted'))
        setDeleteDialogOpen(false)
        setDeleteTarget(null)
        router.refresh()
      } else toast.error(result.error || t('toast.error'))
    })
  }

  const getStatusBadge = (isActive: boolean) => (
    <Badge variant={isActive ? 'default' : 'secondary'}>
      {isActive ? t('active') : t('inactive')}
    </Badge>
  )

  const predefinedColors = [
    '#3b82f6',
    '#10b981',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
    '#ec4899',
    '#6b7280',
    '#14b8a6',
    '#f97316',
  ]

  return (
    <section className="space-y-6" aria-labelledby="shift-types-heading">
      <header className="flex items-center justify-between">
        <div>
          <h2 id="shift-types-heading" className="text-2xl font-bold">
            {t('title')}
          </h2>
          <p className="text-muted-foreground mt-1">{t('description')}</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          {t('create')}
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>{t('list')}</CardTitle>
        </CardHeader>
        <CardContent>
          {shiftTypes.length === 0 ? (
            <section className="text-center py-8" aria-labelledby="shift-types-empty-heading">
              <Palette className="mx-auto h-12 w-12 text-muted-foreground mb-4" aria-hidden />
              <h3 id="shift-types-empty-heading" className="text-lg font-medium">
                {t('empty.title')}
              </h3>
              <p className="text-muted-foreground mt-2">{t('empty.description')}</p>
              <Button onClick={handleCreate} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                {t('create')}
              </Button>
            </section>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('table.name')}</TableHead>
                  <TableHead>{t('table.icon')}</TableHead>
                  <TableHead>{t('table.duration')}</TableHead>
                  <TableHead>{t('table.classification')}</TableHead>
                  <TableHead>{t('table.color')}</TableHead>
                  <TableHead>{t('table.description')}</TableHead>
                  <TableHead>{t('table.status')}</TableHead>
                  <TableHead>{t('table.global')}</TableHead>
                  <TableHead>{t('table.shiftsCount')}</TableHead>
                  <TableHead>{t('table.areasCount')}</TableHead>
                  <TableHead>{t('table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shiftTypes.map((shiftType) => (
                  <TableRow key={shiftType.id}>
                    <TableCell className="font-medium">{shiftType.name}</TableCell>
                    <TableCell>
                      <span style={{ color: shiftType.color }}>
                        <IconDisplay iconName={shiftType.icon ?? DEFAULT_SHIFT_TYPE_ICON} size={18} />
                      </span>
                    </TableCell>
                    <TableCell>{formatDuration(shiftType.durationMinutes)}</TableCell>
                    <TableCell>{t(`classification.${shiftType.classification}`)}</TableCell>
                    <TableCell>
                      <span className="flex items-center gap-2">
                        <span
                          className="w-4 h-4 rounded-full border shrink-0"
                          style={{ backgroundColor: shiftType.color }}
                          aria-hidden
                        />
                        <span className="text-xs text-muted-foreground">{shiftType.color}</span>
                      </span>
                    </TableCell>
                    <TableCell>{shiftType.description || '-'}</TableCell>
                    <TableCell>{getStatusBadge(shiftType.isActive)}</TableCell>
                    <TableCell>
                      <span className="text-muted-foreground text-sm">
                        {shiftType.isGlobal ? t('table.globalYes') : t('table.globalNo')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{shiftType._count?.shifts || 0}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {shiftType.isGlobal
                          ? '-'
                          : (shiftType._count?.areaShiftTypes ??
                            shiftType.areaShiftTypes?.length ??
                            0)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(shiftType)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(shiftType)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={isCreateDialogOpen || editingShiftType !== null}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false)
            resetForm()
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingShiftType ? t('edit.title') : t('createModal.title')}</DialogTitle>
            <DialogDescription>
              {editingShiftType ? t('edit.description') : t('createModal.description')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 py-5 max-h-[70vh] overflow-y-auto overflow-x-hidden overscroll-contain pt-px">
            <div className="grid gap-2 scroll-mt-4">
              <Label htmlFor="name">{t('form.name')}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('form.namePlaceholder')}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="durationHours">{t('form.durationHours')}</Label>
                <Input
                  id="durationHours"
                  type="number"
                  min={0}
                  max={24}
                  value={formData.durationHours}
                  onChange={(e) => setFormData({ ...formData, durationHours: e.target.value })}
                  placeholder={t('form.durationPlaceholder')}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="durationMinutes">{t('form.durationMinutes')}</Label>
                <Input
                  id="durationMinutes"
                  type="number"
                  min={0}
                  max={59}
                  value={formData.durationMinutes}
                  onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="grid gap-2 scroll-mt-4">
              <Label htmlFor="classification">{t('form.classification')}</Label>
              <Select
                value={formData.classification}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    classification: value as ShiftClassification,
                  })
                }
              >
                <SelectTrigger id="classification" className="w-full">
                  <SelectValue placeholder={t('form.classification')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DAY">{t('classification.DAY')}</SelectItem>
                  <SelectItem value="NIGHT">{t('classification.NIGHT')}</SelectItem>
                  <SelectItem value="MIXED">{t('classification.MIXED')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>{t('form.icon')}</Label>
              <IconPicker
                value={formData.icon}
                onChange={(v) => setFormData({ ...formData, icon: v })}
                icons={SHIFT_TYPE_ICONS}
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
              <Label htmlFor="color">{t('form.color')}</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="h-10 w-20"
                />
                <div className="flex gap-1">
                  {predefinedColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className="w-6 h-6 cursor-pointer rounded-full border-2 border-transparent hover:border-gray-300"
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData({ ...formData, color })}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">{t('form.description')}</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={t('form.descriptionPlaceholder')}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <div className="flex items-center gap-1.5">
                  <Label htmlFor="minStaffRequired">{t('form.minStaffRequired')}</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info
                        className="text-muted-foreground h-3.5 w-3.5 shrink-0 cursor-help"
                        aria-hidden
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      {t('form.minStaffRequiredTooltip')}
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  id="minStaffRequired"
                  type="number"
                  min={1}
                  value={formData.minStaffRequired}
                  onChange={(e) => setFormData({ ...formData, minStaffRequired: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center gap-1.5">
                  <Label htmlFor="idealStaffCount">{t('form.idealStaffCount')}</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info
                        className="text-muted-foreground h-3.5 w-3.5 shrink-0 cursor-help"
                        aria-hidden
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      {t('form.idealStaffCountTooltip')}
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  id="idealStaffCount"
                  type="number"
                  min={1}
                  value={formData.idealStaffCount}
                  onChange={(e) => setFormData({ ...formData, idealStaffCount: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <div className="flex items-center gap-1.5">
                  <Label htmlFor="maxStaffAllowed">{t('form.maxStaffAllowed')}</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info
                        className="text-muted-foreground h-3.5 w-3.5 shrink-0 cursor-help"
                        aria-hidden
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      {t('form.maxStaffAllowedTooltip')}
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  id="maxStaffAllowed"
                  type="number"
                  min={1}
                  value={formData.maxStaffAllowed}
                  onChange={(e) => setFormData({ ...formData, maxStaffAllowed: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isGlobal"
                checked={formData.isGlobal}
                onChange={(e) => setFormData({ ...formData, isGlobal: e.target.checked })}
                className="rounded border-gray-300"
              />
              <div className="flex items-center gap-1.5">
                <Label htmlFor="isGlobal">{t('form.isGlobal')}</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="text-muted-foreground inline-flex cursor-help rounded p-0.5"
                    >
                      <Info className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      <span className="sr-only">{t('form.isGlobal')}</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    {t('form.isGlobalTooltip')}
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
            {!formData.isGlobal && (
              <div className="grid gap-2">
                <Label id="areas-label">{t('form.areasLabel')}</Label>
                <SearchableAddableList<AreaOption>
                  items={areas}
                  selectedIds={new Set(formData.areaConfigs.map((c) => c.areaId))}
                  onSelectionChange={(ids) => {
                    setFormData((prev) => ({
                      ...prev,
                      areaConfigs: [
                        ...prev.areaConfigs.filter((c) => ids.has(c.areaId)),
                        ...Array.from(ids)
                          .filter((id) => !prev.areaConfigs.some((c) => c.areaId === id))
                          .map((areaId) => ({ areaId, isActive: true })),
                      ],
                    }))
                  }}
                  getItemId={(a) => a.id}
                  getSearchableText={(a) => a.name}
                  renderItem={(a) => <span className="text-sm font-medium">{a.name}</span>}
                  searchPlaceholder={t('form.areasPlaceholder')}
                  searchLabel={t('form.areasSearchLabel')}
                  emptyMessage={t('form.areasEmpty')}
                  noResultsMessage={t('form.areasNoResults')}
                  selectedLabel={t('form.areasSelected')}
                  removeItemAriaLabel={(a) => t('form.areasRemoveArea', { name: a.name })}
                />
              </div>
            )}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive || false}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded border-gray-300"
              />
              <Label htmlFor="isActive">{t('form.active')}</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false)
                resetForm()
              }}
            >
              {t('form.cancel')}
            </Button>
            <Button onClick={handleSave} disabled={!hasChanges || isPending}>
              {isPending ? t('form.saving') : t('form.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showSaveConfirm} onOpenChange={setShowSaveConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('form.saveConfirm.title')}</AlertDialogTitle>
            <AlertDialogDescription>{t('form.saveConfirm.description')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>
              {t('form.saveConfirm.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction onClick={performSave} disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('form.saveConfirm.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteDialogOpen(false)
            setDeleteTarget(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('delete.title')}</DialogTitle>
            <DialogDescription>{t('delete.description')}</DialogDescription>
          </DialogHeader>
          {deleteTarget && (
            <div className="py-5">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <div
                  className="w-6 h-6 rounded-full border"
                  style={{ backgroundColor: deleteTarget.color }}
                />
                <div>
                  <div className="font-medium">{deleteTarget.name}</div>
                  {deleteTarget.description && (
                    <div className="text-sm text-muted-foreground">{deleteTarget.description}</div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    {t('delete.shiftsCount', { count: deleteTarget._count?.shifts ?? 0 })}
                  </div>
                </div>
              </div>
              {(deleteTarget._count?.shifts ?? 0) === 0 && (
                <div className="text-sm text-primary">
                  <Check className="inline-block mr-1 h-4 w-4" />
                  {t('delete.noShiftsWarning')}
                </div>
              )}
              {(deleteTarget._count?.shifts ?? 0) > 0 && (
                <div className="text-sm text-muted-foreground">
                  <X className="inline-block mr-1 h-4 w-4" />
                  {t('delete.hasShiftsWarning')}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setDeleteTarget(null)
              }}
            >
              {t('delete.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={
                isPending || Boolean(deleteTarget && (deleteTarget._count?.shifts ?? 0) > 0)
              }
            >
              {isPending ? t('delete.deleting') : t('delete.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
