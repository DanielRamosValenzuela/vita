'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

import { useRouter } from '@/i18n/navigation'
import { CalendarDays } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/src/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/src/shared/ui/dialog'

import { createShiftAction } from '../api/shift-actions'
import type { CreateShiftData } from '../types/shift-types'
import { ShiftForm, type ShiftTypeOption } from './shift-form'

interface ShiftFormDialogProps {
  organizationId: string
  users: Array<{ id: string; name: string; role: string }>
  areas: Array<{ id: string; name: string; description?: string }>
  shiftTypes: ShiftTypeOption[]
}

export function ShiftFormDialog({
  organizationId,
  users,
  areas,
  shiftTypes,
}: ShiftFormDialogProps) {
  const t = useTranslations('shifts')
  const tToast = useTranslations()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (data: CreateShiftData) => {
    setIsSubmitting(true)
    try {
      const result = await createShiftAction(data)

      if (result.success) {
        toast.success(tToast('toast.shifts.created'))
        setOpen(false)
        router.refresh()
      } else toast.error(result.error || tToast('toast.shifts.errorCreating'))
    } catch (error) {
      toast.error(tToast('toast.shifts.errorCreating'))
      console.error('Error creating shift:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <CalendarDays className="mr-2 h-4 w-4" />
          {t('newShift')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('form.dialogTitle')}</DialogTitle>
        </DialogHeader>
        <ShiftForm
          _organizationId={organizationId}
          users={users}
          areas={areas}
          shiftTypes={shiftTypes}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isPending={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  )
}
