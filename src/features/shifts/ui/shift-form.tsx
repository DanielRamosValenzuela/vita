'use client'

import { useEffect, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { CalendarIcon, Clock } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { Button } from '@/src/shared/ui/button'
import { Calendar } from '@/src/shared/ui/calendar'
import { Checkbox } from '@/src/shared/ui/checkbox'
import { Input } from '@/src/shared/ui/input'
import { Label } from '@/src/shared/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/src/shared/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/shared/ui/select'
import { Textarea } from '@/src/shared/ui/textarea'

import { checkShiftConflictsClient } from '@/src/entities/shift/lib/shift-validation-client'

import type { CreateShiftData, CreateShiftFormData } from '../types/shift-types'
import { createShiftSchema, type ShiftFormData } from '../lib/shift-form-schemas'

export type ShiftTypeOption = {
  id: string
  name: string
  color: string
  isGlobal?: boolean
  areaShiftTypes?: Array<{ areaId: string; isActive: boolean }>
}

interface ShiftFormProps {
  _organizationId: string
  users: Array<{ id: string; name: string; role: string; areaIds?: string[] }>
  areas: Array<{ id: string; name: string; description?: string }>
  shiftTypes: ShiftTypeOption[]
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
  const tValidation = useTranslations('shifts.validation')
  const [isCheckingConflicts, setIsCheckingConflicts] = useState(false)

  const shiftSchema = useMemo(
    () =>
      createShiftSchema((key: string) => tValidation(key)),
    [tValidation]
  )

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

  const areaId = form.watch('areaId')
  const availableShiftTypes = useMemo(() => {
    if (!areaId) return shiftTypes
    return shiftTypes.filter(
      (st) =>
        st.isGlobal === true ||
        (st.areaShiftTypes?.some((ast) => ast.areaId === areaId && ast.isActive) ?? false)
    )
  }, [shiftTypes, areaId])

  const availableUsers = useMemo(() => {
    if (!areaId) return []
    return users.filter(
      (u) => u.role !== 'STAFF_HEALTH' || (Array.isArray(u.areaIds) && u.areaIds.includes(areaId))
    )
  }, [users, areaId])

  useEffect(() => {
    const currentId = form.getValues('shiftTypeId')
    if (currentId && !availableShiftTypes.some((st) => st.id === currentId))
      form.setValue('shiftTypeId', '')
  }, [availableShiftTypes, form])

  useEffect(() => {
    const currentUserId = form.getValues('userId')
    if (currentUserId && !availableUsers.some((u) => u.id === currentUserId))
      form.setValue('userId', '')
  }, [availableUsers, form])

  const selectedArea = areas.find((area) => area.id === areaId)

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
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">{t('title.label')}</Label>
          <Input id="title" placeholder={t('title.placeholder')} {...form.register('title')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="userId">{t('user.label')}</Label>
          <Select
            value={form.watch('userId')}
            onValueChange={(value) => form.setValue('userId', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('user.placeholder')} />
            </SelectTrigger>
            <SelectContent>
              {availableUsers.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name} ({user.role})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="areaId">{t('area.label')}</Label>
          <Select
            value={form.watch('areaId')}
            onValueChange={(value) => form.setValue('areaId', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('area.placeholder')} />
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
          <Label htmlFor="shiftTypeId">{t('shiftType.label')}</Label>
          <Select
            value={form.watch('shiftTypeId')}
            onValueChange={(value) => form.setValue('shiftTypeId', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('shiftType.placeholder')} />
            </SelectTrigger>
            <SelectContent>
              {availableShiftTypes.map((type) => (
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
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="startDate">{t('date.label')}</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {form.watch('startDate') ? (
                  format(form.watch('startDate'), 'PPP')
                ) : (
                  <span>{t('date.placeholder')}</span>
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
          <Label htmlFor="startTime">{t('startTime.label')}</Label>
          <Input id="startTime" type="time" {...form.register('startTime')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endTime">{t('endTime.label')}</Label>
          <Input id="endTime" type="time" {...form.register('endTime')} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">{t('notes.label')}</Label>
        <Textarea
          id="notes"
          placeholder={t('notes.placeholder')}
          rows={3}
          {...form.register('notes')}
        />
      </div>

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
              {isCheckingConflicts ? t('conflicts.checking') : t('saving')}
            </>
          ) : (
            t('save')
          )}
        </Button>
      </div>
    </form>
  )
}
