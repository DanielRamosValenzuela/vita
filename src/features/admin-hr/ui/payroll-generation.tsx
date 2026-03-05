'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'

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
import { Button } from '@/src/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/shared/ui/card'
import { Label } from '@/src/shared/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/shared/ui/select'
import { toastActionResult } from '@/src/shared/lib/utils/toast-action-result'

import { generatePayrollAction } from '../api/payroll-actions'

const MONTHS = [
  { value: '1', label: 'Enero' },
  { value: '2', label: 'Febrero' },
  { value: '3', label: 'Marzo' },
  { value: '4', label: 'Abril' },
  { value: '5', label: 'Mayo' },
  { value: '6', label: 'Junio' },
  { value: '7', label: 'Julio' },
  { value: '8', label: 'Agosto' },
  { value: '9', label: 'Septiembre' },
  { value: '10', label: 'Octubre' },
  { value: '11', label: 'Noviembre' },
  { value: '12', label: 'Diciembre' },
]

export function PayrollGeneration() {
  const t = useTranslations('payroll.generate')
  const now = new Date()
  const defaultMonth = now.getMonth() === 0 ? 12 : now.getMonth()
  const defaultYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()

  const [month, setMonth] = useState<string>(String(defaultMonth))
  const [year, setYear] = useState<string>(String(defaultYear))
  const [isPending, startTransition] = useTransition()
  const [showForceDialog, setShowForceDialog] = useState(false)

  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i)

  const handleGenerate = (force = false) => {
    startTransition(async () => {
      const result = await generatePayrollAction({
        month: parseInt(month),
        year: parseInt(year),
        force,
      })

      if (!result.success && result.error?.includes('Ya existe')) {
        setShowForceDialog(true)
        return
      }

      toastActionResult(result)
    })
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <Label>{t('month')}</Label>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('year')}</Label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => handleGenerate()} disabled={isPending}>
              {isPending ? t('generating') : t('button')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showForceDialog} onOpenChange={setShowForceDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('forceConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('forceConfirmDescription')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('~common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowForceDialog(false)
                handleGenerate(true)
              }}
            >
              {t('forceRegenerate')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
