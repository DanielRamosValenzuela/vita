'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { format } from 'date-fns'
import { toast } from 'sonner'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/src/shared/ui/dialog'

import { useRouter } from '@/i18n/navigation'

import { createShiftAction, updateShiftAction } from '../api/shift-actions'
import type { CreateShiftData } from '../types/shift-types'
import type { ShiftWithRelations } from '../types/shift-types'
import { ShiftForm, type ShiftTypeOption } from './shift-form'

function shiftToInitialData(shift: ShiftWithRelations) {
  return {
    title: shift.title ?? '',
    userId: shift.userId,
    areaId: shift.areaId,
    shiftTypeId: shift.shiftTypeId,
    startDate: new Date(shift.startTime),
    startTime: format(new Date(shift.startTime), 'HH:mm'),
    endDate: format(new Date(shift.endTime), 'yyyy-MM-dd'),
    endTime: format(new Date(shift.endTime), 'HH:mm'),
    notes: shift.notes ?? '',
  }
}

interface ShiftFormDialogProps {
  organizationId: string
  users: Array<{ id: string; name: string; role: string; areaIds?: string[] }>
  areas: Array<{ id: string; name: string; description?: string }>
  shiftTypes: ShiftTypeOption[]
  initialAreaId?: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  editingShift: ShiftWithRelations | null
  onSuccess?: () => void
}

export function ShiftFormDialog({
  organizationId,
  users,
  areas,
  shiftTypes,
  initialAreaId,
  open,
  onOpenChange,
  editingShift,
  onSuccess,
}: ShiftFormDialogProps) {
  const t = useTranslations('shifts')
  const tToast = useTranslations()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (data: CreateShiftData) => {
    setIsSubmitting(true)
    try {
      if (editingShift) {
        const result = await updateShiftAction(editingShift.id, data)
        if (result.success) {
          toast.success(tToast('toast.shifts.updated'))
          onOpenChange(false)
          router.refresh()
          onSuccess?.()
        } else
          toast.error(result.error || tToast('toast.shifts.errorCreating'))
      } else {
        const result = await createShiftAction(data)
        if (result.success) {
          toast.success(tToast('toast.shifts.created'))
          onOpenChange(false)
          router.refresh()
          onSuccess?.()
        } else
          toast.error(result.error || tToast('toast.shifts.errorCreating'))
      }
    } catch (error) {
      toast.error(tToast('toast.shifts.errorCreating'))
      console.error('Error saving shift:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  const initialData = editingShift
    ? shiftToInitialData(editingShift)
    : initialAreaId
      ? { areaId: initialAreaId }
      : undefined

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingShift ? t('form.editTitle') : t('form.dialogTitle')}
            </DialogTitle>
            <DialogDescription>
              {editingShift ? t('form.editDescription') : t('form.dialogDescription')}
            </DialogDescription>
          </DialogHeader>
          <ShiftForm
            _organizationId={organizationId}
            users={users}
            areas={areas}
            shiftTypes={shiftTypes}
            initialData={initialData}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isPending={isSubmitting}
          />
        </DialogContent>
    </Dialog>
  )
}
