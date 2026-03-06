'use client'

import { useEffect, useMemo, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { zodResolver } from '@hookform/resolvers/zod'
import { addMinutes, format } from 'date-fns'
import { CalendarIcon, Clock, Search } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { formatDateLong } from '@/src/shared/lib/utils/format'
import { Button } from '@/src/shared/ui/button'
import { Calendar } from '@/src/shared/ui/calendar'
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

import { createShiftSchema, type ShiftFormData } from '../lib/shift-form-schemas'
import type { CreateShiftData, CreateShiftFormData } from '../types/shift-types'

export type ShiftTypeOption = {
  id: string
  name: string
  color: string
  durationMinutes: number
  isGlobal?: boolean
  areaShiftTypes?: Array<{ areaId: string; isActive: boolean }>
}

type FormTranslationFn = ReturnType<typeof useTranslations<'shifts.form'>>

function UserCombobox({
  selectedUserId,
  onSelectUser,
  availableUsers,
  disabled,
  t,
}: {
  selectedUserId: string
  onSelectUser: (id: string) => void
  availableUsers: Array<{ id: string; name: string; role: string }>
  disabled: boolean
  t: FormTranslationFn
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [popoverOpen, setPopoverOpen] = useState(false)

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return availableUsers
    const q = searchQuery.trim().toLowerCase()
    return availableUsers.filter((u) => u.name.toLowerCase().includes(q))
  }, [availableUsers, searchQuery])

  return (
    <div className="space-y-2">
      <Label htmlFor="userId">{t('user.label')}</Label>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-controls="user-listbox"
            aria-expanded={popoverOpen}
            className="w-full justify-between"
            disabled={disabled}
            type="button"
          >
            <span className="truncate">
              {selectedUserId
                ? availableUsers.find((u) => u.id === selectedUserId)?.name || t('user.placeholder')
                : t('user.placeholder')}
            </span>
            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <div className="flex items-center border-b px-3 py-2">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              placeholder={t('user.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-0 focus-visible:ring-0"
              data-autofocus
            />
          </div>
          <div id="user-listbox" role="listbox" className="max-h-[300px] overflow-y-auto p-1">
            {filteredUsers.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                {disabled ? t('user.selectAreaFirst') : t('user.noUsersFound')}
              </div>
            ) : (
              filteredUsers.map((user) => (
                <Button
                  key={user.id}
                  variant="ghost"
                  className="w-full justify-start font-normal"
                  onClick={() => {
                    onSelectUser(user.id)
                    setSearchQuery('')
                    setPopoverOpen(false)
                  }}
                  type="button"
                >
                  {user.name} ({user.role})
                </Button>
              ))
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

function DateTimeFields({
  form,
  selectedShiftType,
  locale,
  t,
}: {
  form: ReturnType<typeof useForm<ShiftFormData>>
  selectedShiftType: ShiftTypeOption | undefined
  locale: 'es' | 'en'
  t: FormTranslationFn
}) {
  const endDateDisplay = (() => {
    const endDate = form.watch('endDate')
    if (!endDate) return selectedShiftType ? t('endDate.calculated') : t('endDate.selectShiftType')
    const [year, month, day] = endDate.split('-').map(Number)
    return formatDateLong(new Date(year, month - 1, day), locale)
  })()

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="startDate">{t('date.label')}</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {form.watch('startDate') ? (
                  formatDateLong(new Date(form.watch('startDate')), locale)
                ) : (
                  <span>{t('date.placeholder')}</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={form.watch('startDate') ? new Date(form.watch('startDate')) : undefined}
                onSelect={(date) => date && form.setValue('startDate', date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">{t('endDate.label')}</Label>
          <Input
            id="endDate"
            type="text"
            value={endDateDisplay}
            disabled
            className="bg-muted cursor-not-allowed"
            aria-label={t('endDate.label')}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="startTime">{t('startTime.label')}</Label>
          <Input id="startTime" type="time" {...form.register('startTime')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endTime">{t('endTime.label')}</Label>
          <Input
            id="endTime"
            type="time"
            value={form.watch('endTime')}
            disabled
            className="bg-muted cursor-not-allowed"
            aria-label={t('endTime.label')}
          />
        </div>
      </div>
    </>
  )
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
  const locale = useLocale() as 'es' | 'en'
  const [isCheckingConflicts, setIsCheckingConflicts] = useState(false)

  const shiftSchema = useMemo(
    () => createShiftSchema((key: string) => tValidation(key)),
    [tValidation]
  )

  const form = useForm<ShiftFormData>({
    resolver: zodResolver(shiftSchema),
    defaultValues: {
      title:
        initialData?.title ||
        (initialData?.shiftTypeId
          ? (shiftTypes.find((st) => st.id === initialData.shiftTypeId)?.name ?? '')
          : ''),
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
  const shiftTypeId = form.watch('shiftTypeId')
  const startDate = form.watch('startDate')
  const startTime = form.watch('startTime')

  const selectedShiftType = useMemo(
    () => shiftTypes.find((st) => st.id === shiftTypeId),
    [shiftTypes, shiftTypeId]
  )

  const availableShiftTypes = useMemo(() => {
    if (!areaId) return shiftTypes
    return shiftTypes.filter(
      (st) => !!st.isGlobal || (st.areaShiftTypes?.some((ast) => ast.areaId === areaId) ?? false)
    )
  }, [shiftTypes, areaId])

  const availableUsers = useMemo(() => {
    if (!areaId) return []
    return users.filter(
      (u) => u.role !== 'STAFF' || (Array.isArray(u.areaIds) && u.areaIds.includes(areaId))
    )
  }, [users, areaId])

  useEffect(() => {
    if (!selectedShiftType || !startDate || !startTime) {
      if (!selectedShiftType) {
        form.setValue('endDate', undefined)
        form.setValue('endTime', '17:00')
      }
      return
    }

    try {
      const [startHour, startMinute] = startTime.split(':').map(Number)
      const startDateObj = startDate instanceof Date ? startDate : new Date(startDate)
      const startDateTime = new Date(startDateObj)
      startDateTime.setHours(startHour, startMinute, 0, 0)

      const endDateTime = addMinutes(startDateTime, selectedShiftType.durationMinutes)
      const endDateStr = format(endDateTime, 'yyyy-MM-dd')
      const endTimeStr = format(endDateTime, 'HH:mm')

      const currentEndDate = form.getValues('endDate')
      const currentEndTime = form.getValues('endTime')

      if (currentEndDate !== endDateStr) form.setValue('endDate', endDateStr)
      if (currentEndTime !== endTimeStr) form.setValue('endTime', endTimeStr)
    } catch (error) {
      console.error('Error calculating end date/time:', error)
    }
  }, [selectedShiftType, startDate, startTime, form])

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

  useEffect(() => {
    if (!areaId) form.setValue('userId', '')
  }, [areaId, form])

  const selectedArea = areas.find((area) => area.id === areaId)

  const handleSubmit = async (data: CreateShiftFormData) => {
    const startDateTime = new Date(data.startDate)
    const [startHour, startMinute] = data.startTime.split(':')
    startDateTime.setHours(parseInt(startHour), parseInt(startMinute), 0, 0)

    const shiftType = shiftTypes.find((st) => st.id === data.shiftTypeId)
    if (!shiftType) return
    const endDateTime = addMinutes(startDateTime, shiftType.durationMinutes)

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
          <Label htmlFor="shiftTypeId">{t('shiftType.label')}</Label>
          <Select
            value={form.watch('shiftTypeId')}
            onValueChange={(value) => {
              form.setValue('shiftTypeId', value)
              const type = shiftTypes.find((st) => st.id === value)
              if (type) form.setValue('title', type.name)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('shiftType.placeholder')} />
            </SelectTrigger>
            <SelectContent>
              {availableShiftTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: type.color }} />
                    {type.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">{t('title.label')}</Label>
          <Input id="title" placeholder={t('title.placeholder')} {...form.register('title')} />
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

        <UserCombobox
          selectedUserId={form.watch('userId')}
          onSelectUser={(id) => form.setValue('userId', id)}
          availableUsers={availableUsers}
          disabled={!areaId}
          t={t}
        />
      </div>

      <DateTimeFields form={form} selectedShiftType={selectedShiftType} locale={locale} t={t} />

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
        <Button
          type="submit"
          disabled={isPending || isCheckingConflicts || !shiftTypeId || !form.watch('userId')}
        >
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
