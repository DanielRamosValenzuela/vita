'use client'

import { useMemo, useReducer, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { Palette, Plus } from 'lucide-react'
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
import { Spinner } from '@/src/shared/ui/atoms'
import { Badge } from '@/src/shared/ui/badge'
import { Button } from '@/src/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/ui/card'

import { useRouter } from '@/i18n/navigation'

import {
  createShiftTypeAction,
  deleteShiftTypeAction,
  updateShiftTypeAction,
} from '../api/shift-type-actions'
import { DeleteShiftTypeDialog } from './delete-shift-type-dialog'
import { ShiftTypeFormDialog } from './shift-type-form-dialog'
import { ShiftTypesTable } from './shift-types-table'
import {
  DEFAULT_FORM_DATA,
  hasShiftTypeFormChanged,
  INITIAL_STATE,
  shiftTypesReducer,
  type AreaOption,
  type ShiftType,
} from './shift-types-utils'

interface ShiftTypesPageProps {
  shiftTypes: ShiftType[]
  areas: AreaOption[]
  canCreateGlobal?: boolean
  isChief?: boolean
}

export function ShiftTypesPage({
  shiftTypes,
  areas,
  canCreateGlobal = true,
  isChief = false,
}: ShiftTypesPageProps) {
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

  const hasChanges = useMemo(
    () => hasShiftTypeFormChanged(formData, editingShiftType),
    [formData, editingShiftType]
  )

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
    if (!canCreateGlobal)
      dispatch({
        type: 'SET_FORM_DATA',
        formData: { ...DEFAULT_FORM_DATA, isGlobal: false, areaConfigs: [] },
      })
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
              isChief={isChief}
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
        canCreateGlobal={canCreateGlobal}
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
              {isPending && <Spinner size="sm" className="mr-2" />}
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
