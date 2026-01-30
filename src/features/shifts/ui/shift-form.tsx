'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { CalendarIcon, Clock } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/src/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/ui/card'
import { Input } from '@/src/shared/ui/input'
import { Label } from '@/src/shared/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/shared/ui/select'
import { Textarea } from '@/src/shared/ui/textarea'

import { Calendar } from '@/shared/ui/calendar'
import { Checkbox } from '@/shared/ui/checkbox'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import { checkShiftConflictsClient } from '@/src/entities/shift/lib/shift-validation-client'

import type { CreateShiftData, CreateShiftFormData } from '../types/shift-types'

const shiftSchema = z.object({
  title: z.string().optional(),
  userId: z.string().min(1, 'Selecciona un usuario'),
  areaId: z.string().min(1, 'Selecciona un área'),
  shiftTypeId: z.string().min(1, 'Selecciona un tipo de turno'),
  startDate: z.date({
    message: 'Selecciona una fecha de inicio',
  }),
  startTime: z.string().min(1, 'Ingresa la hora de inicio'),
  endDate: z.string().optional(),
  endTime: z.string().min(1, 'Ingresa la hora de fin'),
  notes: z.string().optional(),
})

type ShiftFormData = z.infer<typeof shiftSchema>

interface ShiftFormProps {
  _organizationId: string
  users: Array<{ id: string; name: string; role: string }>
  areas: Array<{ id: string; name: string; description?: string }>
  shiftTypes: Array<{ id: string; name: string; color: string }>
  initialData?: Partial<ShiftFormData>
  onSubmit: (data: CreateShiftData) => Promise<void>
  onCancel: () => void
  isPending?: boolean
}

export function ShiftForm({
  _organizationId,
  users,
  areas,
  shiftTypes,
  initialData,
  onSubmit,
  onCancel,
  isPending = false,
}: ShiftFormProps) {
  const t = useTranslations('shifts.form')
  const [isCheckingConflicts, setIsCheckingConflicts] = useState(false)

  const form = useForm<ShiftFormData>({
    resolver: zodResolver(shiftSchema),
    defaultValues: {
      title: initialData?.title || '',
      userId: initialData?.userId || '',
      areaId: initialData?.areaId || '',
      shiftTypeId: initialData?.shiftTypeId || '',
      startDate: initialData?.startDate || new Date(),
      startTime: initialData?.startTime || '09:00',
      endDate: initialData?.endDate || undefined,
      endTime: initialData?.endTime || '17:00',
      notes: initialData?.notes || '',
    },
  })

  const selectedUser = users.find((user) => user.id === form.watch('userId'))
  const selectedArea = areas.find((area) => area.id === form.watch('areaId'))
  const selectedShiftType = shiftTypes.find((type) => type.id === form.watch('shiftTypeId'))

  const handleSubmit = async (data: CreateShiftFormData) => {
    
    const startDateTime = new Date(data.startDate)
    const [startHour, startMinute] = data.startTime.split(':')
    startDateTime.setHours(parseInt(startHour), parseInt(startMinute), 0, 0)

    const endDateTime = data.endDate ? new Date(data.endDate) : new Date(data.startDate)
    const [endHour, endMinute] = data.endTime.split(':')
    endDateTime.setHours(parseInt(endHour), parseInt(endMinute), 0, 0)

    
    setIsCheckingConflicts(true)
    try {
      const conflictResult = checkShiftConflictsClient(startDateTime, endDateTime)

      if (conflictResult.hasConflict) {
        toast.error(conflictResult.message)
        return
      }

      
      const shiftData: CreateShiftData = {
        ...data,
        startTime: startDateTime,
        endTime: endDateTime,
      }
      await onSubmit(shiftData)
    } catch (_error) {
      toast.error(t('conflicts.error'))
    } finally {
      setIsCheckingConflicts(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{initialData ? t('editTitle') : t('createTitle')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">{t('titleLabel')}</Label>
              <Input id="title" placeholder={t('titlePlaceholder')} {...form.register('title')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="userId">{t('userLabel')}</Label>
              <Select
                value={form.watch('userId')}
                onValueChange={(value) => form.setValue('userId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('userPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedUser && (
                <p className="text-xs text-muted-foreground">
                  {t('selectedUser')}: {selectedUser.name}
                </p>
              )}
            </div>
          </div>

          {}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="areaId">{t('areaLabel')}</Label>
              <Select
                value={form.watch('areaId')}
                onValueChange={(value) => form.setValue('areaId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('areaPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {areas.map((area) => (
                    <SelectItem key={area.id} value={area.id}>
                      {area.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedArea && selectedArea.description && (
                <p className="text-xs text-muted-foreground">{selectedArea.description}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="shiftTypeId">{t('shiftTypeLabel')}</Label>
              <Select
                value={form.watch('shiftTypeId')}
                onValueChange={(value) => form.setValue('shiftTypeId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('shiftTypePlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {shiftTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: type.color }}
                        />
                        {type.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedShiftType && (
                <p className="text-xs text-muted-foreground">
                  {t('selectedShiftType')}: {selectedShiftType.name}
                </p>
              )}
            </div>
          </div>

          {}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate">{t('startDateLabel')}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.watch('startDate') ? (
                      format(form.watch('startDate'), 'PPP')
                    ) : (
                      <span>{t('datePlaceholder')}</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={
                      form.watch('startDate') ? new Date(form.watch('startDate')) : undefined
                    }
                    onSelect={(date) => date && form.setValue('startDate', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="differentEndDate"
                  checked={!!form.watch('endDate')}
                  onCheckedChange={(checked: boolean) =>
                    form.setValue(
                      'endDate',
                      checked ? form.watch('startDate').toString() : undefined
                    )
                  }
                />
                <Label htmlFor="differentEndDate" className="text-sm font-normal">
                  {t('differentEndDate')}
                </Label>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startTime">{t('startTimeLabel')}</Label>
              <Input id="startTime" type="time" {...form.register('startTime')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">{t('endTimeLabel')}</Label>
              <Input id="endTime" type="time" {...form.register('endTime')} />
            </div>
          </div>

          {}
          <div className="space-y-2">
            <Label htmlFor="notes">{t('notesLabel')}</Label>
            <Textarea
              id="notes"
              placeholder={t('notesPlaceholder')}
              rows={3}
              {...form.register('notes')}
            />
          </div>

          {}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isPending || isCheckingConflicts}
            >
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={isPending || isCheckingConflicts}>
              {isPending || isCheckingConflicts ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  {isCheckingConflicts ? t('checking') : t('saving')}
                </>
              ) : (
                t('save')
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
