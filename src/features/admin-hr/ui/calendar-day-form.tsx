'use client'

import { useEffect, useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import type { Country } from '@prisma/client'
import { format } from 'date-fns'
import { Info, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { DAY_TYPES, getLocaleByCountry, type DayType } from '@/src/shared/lib/constants'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/src/shared/ui/alert-dialog'
import { Button } from '@/src/shared/ui/button'
import { Input } from '@/src/shared/ui/input'
import { Label } from '@/src/shared/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/shared/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/src/shared/ui/sheet'
import { Textarea } from '@/src/shared/ui/textarea'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/src/shared/ui/tooltip'

import { deleteCalendarDayAction, upsertCalendarDayAction } from '../api/calendar-actions'

interface CalendarDayFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedDate: Date | null
  existingDay?: {
    id: string
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
  const [isDeleting, setIsDeleting] = useState(false)

  const [dayType, setDayType] = useState<DayType>(existingDay?.type || DAY_TYPES.NORMAL)
  const [dayName, setDayName] = useState(existingDay?.name || '')
  const [dayDescription, setDayDescription] = useState(existingDay?.description || '')
  const [multiplier, setMultiplier] = useState(existingDay?.multiplier.toString() || '1.0')

  useEffect(() => {
    setDayType(existingDay?.type || DAY_TYPES.NORMAL)
    setDayName(existingDay?.name || '')
    setDayDescription(existingDay?.description || '')
    setMultiplier(existingDay?.multiplier?.toString() || '1.0')
  }, [existingDay, selectedDate])

  const dateLocale = getLocaleByCountry(country)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!selectedDate) return

    const multiplierValue = parseFloat(multiplier)
    if (isNaN(multiplierValue) || multiplierValue < 0.1) {
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

  async function handleDelete() {
    if (!existingDay?.id) return

    setIsDeleting(true)
    try {
      const result = await deleteCalendarDayAction(existingDay.id)
      if (result.success) {
        toast.success(result.message)
        onOpenChange(false)
        router.refresh()
      } else toast.error(result.error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {selectedDate && format(selectedDate, 'EEEE, d MMMM yyyy', { locale: dateLocale })}
          </SheetTitle>
          <SheetDescription>{t('editDescription')}</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
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
              min="0.1"
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
              disabled={isPending || isDeleting}
            >
              {t('form.cancel')}
            </Button>
            <Button type="submit" disabled={isPending || isDeleting}>
              {isPending ? t('form.saving') : t('form.save')}
            </Button>
          </div>

          {existingDay?.id && existingDay.type !== DAY_TYPES.NORMAL && (
            <div className="pt-4 border-t">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="destructive"
                    className="w-full"
                    disabled={isPending || isDeleting}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {isDeleting ? t('delete.deleting') : t('delete.title')}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t('delete.title')}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t('delete.description', {
                        name: existingDay.name || t(`dayTypes.${existingDay.type}`),
                      })}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t('delete.cancel')}</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>
                      {t('delete.confirm')}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </form>
      </SheetContent>
    </Sheet>
  )
}
