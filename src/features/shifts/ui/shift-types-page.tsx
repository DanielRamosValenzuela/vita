'use client'

import { useMemo, useReducer, useTransition, type Dispatch, type ReactNode } from 'react'
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

interface ShiftTypeFormData {
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
}

interface ShiftTypesState {
  isCreateDialogOpen: boolean
  editingShiftType: ShiftType | null
  deleteDialogOpen: boolean
  deleteTarget: ShiftType | null
  showSaveConfirm: boolean
  formData: ShiftTypeFormData
}

type ShiftTypesAction =
  | { type: 'OPEN_CREATE' }
  | { type: 'OPEN_EDIT'; shiftType: ShiftType }
  | { type: 'CLOSE_DIALOG' }
  | { type: 'OPEN_DELETE'; shiftType: ShiftType }
  | { type: 'CLOSE_DELETE' }
  | {
      type: 'UPDATE_FORM'
      field: keyof ShiftTypeFormData
      value: ShiftTypeFormData[keyof ShiftTypeFormData]
    }
  | { type: 'SET_FORM_DATA'; formData: ShiftTypeFormData }
  | { type: 'TOGGLE_SAVE_CONFIRM'; open: boolean }
  | { type: 'RESET_FORM' }

const DEFAULT_FORM_DATA: ShiftTypeFormData = {
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
}

const INITIAL_STATE: ShiftTypesState = {
  isCreateDialogOpen: false,
  editingShiftType: null,
  deleteDialogOpen: false,
  deleteTarget: null,
  showSaveConfirm: false,
  formData: DEFAULT_FORM_DATA,
}

const shiftTypesReducer = (state: ShiftTypesState, action: ShiftTypesAction): ShiftTypesState => {
  switch (action.type) {
    case 'OPEN_CREATE':
      return {
        ...state,
        isCreateDialogOpen: true,
        editingShiftType: null,
        formData: DEFAULT_FORM_DATA,
      }
    case 'OPEN_EDIT': {
      const h = Math.floor(action.shiftType.durationMinutes / 60)
      const m = action.shiftType.durationMinutes % 60
      const areaConfigs =
        action.shiftType.areaShiftTypes?.map((a) => ({
          areaId: a.areaId ?? a.area?.id ?? '',
          isActive: a.isActive ?? true,
        })) ?? []
      return {
        ...state,
        editingShiftType: action.shiftType,
        formData: {
          name: action.shiftType.name,
          description: action.shiftType.description || '',
          icon: action.shiftType.icon ?? 'Clock',
          durationHours: String(h),
          durationMinutes: String(m),
          classification: action.shiftType.classification,
          color: action.shiftType.color,
          minStaffRequired: String(action.shiftType.minStaffRequired),
          idealStaffCount: String(action.shiftType.idealStaffCount),
          maxStaffAllowed: String(action.shiftType.maxStaffAllowed),
          isGlobal: action.shiftType.isGlobal,
          isActive: action.shiftType.isActive,
          areaConfigs,
        },
      }
    }
    case 'CLOSE_DIALOG':
      return {
        ...state,
        isCreateDialogOpen: false,
        editingShiftType: null,
        formData: DEFAULT_FORM_DATA,
      }
    case 'OPEN_DELETE':
      return { ...state, deleteDialogOpen: true, deleteTarget: action.shiftType }
    case 'CLOSE_DELETE':
      return { ...state, deleteDialogOpen: false, deleteTarget: null }
    case 'UPDATE_FORM':
      return { ...state, formData: { ...state.formData, [action.field]: action.value } }
    case 'SET_FORM_DATA':
      return { ...state, formData: action.formData }
    case 'TOGGLE_SAVE_CONFIRM':
      return { ...state, showSaveConfirm: action.open }
    case 'RESET_FORM':
      return { ...state, formData: DEFAULT_FORM_DATA }
    default:
      return state
  }
}

const PREDEFINED_COLORS = [
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

interface ShiftTypesTableProps {
  shiftTypes: ShiftType[]
  formatDuration: (mins: number) => string
  getStatusBadge: (isActive: boolean) => ReactNode
  onEdit: (shiftType: ShiftType) => void
  onDelete: (shiftType: ShiftType) => void
}

function ShiftTypesTable({
  shiftTypes,
  formatDuration,
  getStatusBadge,
  onEdit,
  onDelete,
}: ShiftTypesTableProps) {
  const t = useTranslations('shifts.shiftTypes')

  return (
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
                  : (shiftType._count?.areaShiftTypes ?? shiftType.areaShiftTypes?.length ?? 0)}
              </span>
            </TableCell>
            <TableCell>
              <span className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => onEdit(shiftType)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(shiftType)}
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
  )
}

interface ShiftTypeFormDialogProps {
  isOpen: boolean
  formData: ShiftTypeFormData
  editingShiftType: ShiftType | null
  dispatch: Dispatch<ShiftTypesAction>
  isPending: boolean
  hasChanges: boolean
  areas: AreaOption[]
  onSave: () => void
}

function ShiftTypeFormDialog({
  isOpen,
  formData,
  editingShiftType,
  dispatch,
  isPending,
  hasChanges,
  areas,
  onSave,
}: ShiftTypeFormDialogProps) {
  const t = useTranslations('shifts.shiftTypes')

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) dispatch({ type: 'CLOSE_DIALOG' })
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
              onChange={(e) =>
                dispatch({ type: 'UPDATE_FORM', field: 'name', value: e.target.value })
              }
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
                onChange={(e) =>
                  dispatch({ type: 'UPDATE_FORM', field: 'durationHours', value: e.target.value })
                }
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
                onChange={(e) =>
                  dispatch({ type: 'UPDATE_FORM', field: 'durationMinutes', value: e.target.value })
                }
                placeholder="0"
              />
            </div>
          </div>
          <div className="grid gap-2 scroll-mt-4">
            <Label htmlFor="classification">{t('form.classification')}</Label>
            <Select
              value={formData.classification}
              onValueChange={(value) =>
                dispatch({
                  type: 'UPDATE_FORM',
                  field: 'classification',
                  value: value as ShiftClassification,
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
              onChange={(v) => dispatch({ type: 'UPDATE_FORM', field: 'icon', value: v })}
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
                onChange={(e) =>
                  dispatch({ type: 'UPDATE_FORM', field: 'color', value: e.target.value })
                }
                className="h-10 w-20"
              />
              <div className="flex gap-1">
                {PREDEFINED_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className="w-6 h-6 cursor-pointer rounded-full border-2 border-transparent hover:border-gray-300"
                    style={{ backgroundColor: color }}
                    onClick={() => dispatch({ type: 'UPDATE_FORM', field: 'color', value: color })}
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
              onChange={(e) =>
                dispatch({ type: 'UPDATE_FORM', field: 'description', value: e.target.value })
              }
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
                onChange={(e) =>
                  dispatch({
                    type: 'UPDATE_FORM',
                    field: 'minStaffRequired',
                    value: e.target.value,
                  })
                }
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
                onChange={(e) =>
                  dispatch({ type: 'UPDATE_FORM', field: 'idealStaffCount', value: e.target.value })
                }
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
                onChange={(e) =>
                  dispatch({ type: 'UPDATE_FORM', field: 'maxStaffAllowed', value: e.target.value })
                }
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isGlobal"
              checked={formData.isGlobal}
              onChange={(e) =>
                dispatch({ type: 'UPDATE_FORM', field: 'isGlobal', value: e.target.checked })
              }
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
                  dispatch({
                    type: 'SET_FORM_DATA',
                    formData: {
                      ...formData,
                      areaConfigs: [
                        ...formData.areaConfigs.filter((c) => ids.has(c.areaId)),
                        ...Array.from(ids)
                          .filter((id) => !formData.areaConfigs.some((c) => c.areaId === id))
                          .map((areaId) => ({ areaId, isActive: true })),
                      ],
                    },
                  })
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
              onChange={(e) =>
                dispatch({ type: 'UPDATE_FORM', field: 'isActive', value: e.target.checked })
              }
              className="rounded border-gray-300"
            />
            <Label htmlFor="isActive">{t('form.active')}</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => dispatch({ type: 'CLOSE_DIALOG' })}>
            {t('form.cancel')}
          </Button>
          <Button onClick={onSave} disabled={!hasChanges || isPending}>
            {isPending ? t('form.saving') : t('form.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface DeleteShiftTypeDialogProps {
  deleteDialogOpen: boolean
  deleteTarget: ShiftType | null
  dispatch: Dispatch<ShiftTypesAction>
  isPending: boolean
  onConfirm: () => void
}

function DeleteShiftTypeDialog({
  deleteDialogOpen,
  deleteTarget,
  dispatch,
  isPending,
  onConfirm,
}: DeleteShiftTypeDialogProps) {
  const t = useTranslations('shifts.shiftTypes')

  return (
    <Dialog
      open={deleteDialogOpen}
      onOpenChange={(open) => {
        if (!open) dispatch({ type: 'CLOSE_DELETE' })
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
          <Button variant="outline" onClick={() => dispatch({ type: 'CLOSE_DELETE' })}>
            {t('delete.cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isPending || Boolean(deleteTarget && (deleteTarget._count?.shifts ?? 0) > 0)}
          >
            {isPending ? t('delete.deleting') : t('delete.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function ShiftTypesPage({ shiftTypes, areas }: ShiftTypesPageProps) {
  const t = useTranslations('shifts.shiftTypes')
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [state, dispatch] = useReducer(shiftTypesReducer, INITIAL_STATE)
  const {
    formData,
    editingShiftType,
    isCreateDialogOpen,
    showSaveConfirm,
    deleteDialogOpen,
    deleteTarget,
  } = state

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

  const formatDuration = (mins: number) => {
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return m > 0 ? `${h}h ${m}min` : `${h}h`
  }

  const getStatusBadge = (isActive: boolean) => (
    <Badge variant={isActive ? 'default' : 'secondary'}>
      {isActive ? t('active') : t('inactive')}
    </Badge>
  )

  const handleCreate = () => {
    dispatch({ type: 'OPEN_CREATE' })
  }

  const handleEdit = (shiftType: ShiftType) => {
    dispatch({ type: 'OPEN_EDIT', shiftType })
  }

  const handleDelete = (shiftType: ShiftType) => {
    dispatch({ type: 'OPEN_DELETE', shiftType })
  }

  const handleSave = () => {
    if (!hasChanges) return
    dispatch({ type: 'TOGGLE_SAVE_CONFIRM', open: true })
  }

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
      dispatch({ type: 'TOGGLE_SAVE_CONFIRM', open: false })
      let result
      if (editingShiftType) result = await updateShiftTypeAction(editingShiftType.id, payload)
      else result = await createShiftTypeAction(payload)

      if (result.success) {
        toast.success(editingShiftType ? t('toast.updated') : t('toast.created'))
        dispatch({ type: 'CLOSE_DIALOG' })
        router.push('/dashboard/shift-types')
      } else toast.error(result.error || t('toast.error'))
    })
  }

  const confirmDelete = () => {
    if (!deleteTarget) return

    startTransition(async () => {
      const result = await deleteShiftTypeAction(deleteTarget.id)

      if (result.success) {
        toast.success(t('toast.deleted'))
        dispatch({ type: 'CLOSE_DELETE' })
        router.refresh()
      } else toast.error(result.error || t('toast.error'))
    })
  }

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
            <ShiftTypesTable
              shiftTypes={shiftTypes}
              formatDuration={formatDuration}
              getStatusBadge={getStatusBadge}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </CardContent>
      </Card>

      <ShiftTypeFormDialog
        isOpen={isCreateDialogOpen || editingShiftType !== null}
        formData={formData}
        editingShiftType={editingShiftType}
        dispatch={dispatch}
        isPending={isPending}
        hasChanges={hasChanges}
        areas={areas}
        onSave={handleSave}
      />

      <AlertDialog
        open={showSaveConfirm}
        onOpenChange={(open) => dispatch({ type: 'TOGGLE_SAVE_CONFIRM', open })}
      >
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

      <DeleteShiftTypeDialog
        deleteDialogOpen={deleteDialogOpen}
        deleteTarget={deleteTarget}
        dispatch={dispatch}
        isPending={isPending}
        onConfirm={confirmDelete}
      />
    </section>
  )
}
