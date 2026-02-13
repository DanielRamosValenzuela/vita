'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import type { Country } from '@prisma/client'
import { format } from 'date-fns'
import { Info } from 'lucide-react'
import { toast } from 'sonner'

import { DAY_TYPES, getLocaleByCountry, type DayType } from '@/src/shared/lib/constants'
import { Button } from '@/src/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Textarea } from '@/src/shared/ui/textarea'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/src/shared/ui/tooltip'

import { upsertCalendarDayAction } from '../api/calendar-actions'

interface CalendarDayFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedDate: Date | null
  existingDay?: {
    type: DayType
    name: string | null
    description: string | null
    multiplier: number
    isRecurring: boolean
  }
  country: Country
}

export function CalendarDayForm({
  open,
  onOpenChange,
  selectedDate,
  existingDay,
  country,
}: CalendarDayFormProps) {
  const t = useTranslations('adminHR.calendar')
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [dayType, setDayType] = useState<DayType>(existingDay?.type || DAY_TYPES.NORMAL)
  const [dayName, setDayName] = useState(existingDay?.name || '')
  const [dayDescription, setDayDescription] = useState(existingDay?.description || '')
  const [multiplier, setMultiplier] = useState(existingDay?.multiplier.toString() || '1.0')

  const dateLocale = getLocaleByCountry(country)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!selectedDate) return

    const multiplierValue = parseFloat(multiplier)
    if (isNaN(multiplierValue) || multiplierValue < 0) {
      toast.error(t('errors.invalidMultiplier'))
      return
    }

    startTransition(async () => {
      const result = await upsertCalendarDayAction({
        date: selectedDate,
        type: dayType,
        name: dayName.trim() || undefined,
        description: dayDescription.trim() || undefined,
        multiplier: multiplierValue,
        isRecurring: false,
      })

      if (result.success) {
        toast.success(result.message)
        onOpenChange(false)
        router.refresh()
      } else toast.error(result.error)
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {selectedDate && format(selectedDate, 'EEEE, d MMMM yyyy', { locale: dateLocale })}
          </DialogTitle>
          <DialogDescription>{t('editDescription')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Label htmlFor="dayType">{t('form.dayType')}</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>{t('form.dayTypeTooltip')}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Select value={dayType} onValueChange={(value) => setDayType(value as DayType)}>
              <SelectTrigger id="dayType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(DAY_TYPES).map(([key, value]) => (
                  <SelectItem key={value} value={value}>
                    {t(`dayTypes.${key}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Label htmlFor="multiplier">{t('form.multiplier')}</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>{t('form.multiplierTooltip')}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="multiplier"
              type="number"
              step="0.1"
              min="0"
              value={multiplier}
              onChange={(e) => setMultiplier(e.target.value)}
              placeholder="1.0"
            />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Label htmlFor="dayName">{t('form.name')}</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>{t('form.nameTooltip')}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="dayName"
              value={dayName}
              onChange={(e) => setDayName(e.target.value)}
              placeholder={t('form.namePlaceholder')}
            />
          </div>

          <div>
            <Label htmlFor="dayDescription">{t('form.description')}</Label>
            <Textarea
              id="dayDescription"
              value={dayDescription}
              onChange={(e) => setDayDescription(e.target.value)}
              placeholder={t('form.descriptionPlaceholder')}
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              {t('form.cancel')}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? t('form.saving') : t('form.save')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
