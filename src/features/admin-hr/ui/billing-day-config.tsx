'use client'

import { useEffect, useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'

import { toastActionResult } from '@/src/shared/lib/utils/toast-action-result'
import { Button } from '@/src/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/shared/ui/card'
import { Input } from '@/src/shared/ui/input'
import { Label } from '@/src/shared/ui/label'

import { getBillingConfigAction, updateBillingDayAction } from '../api/payroll-actions'

export function BillingDayConfig() {
  const t = useTranslations('payroll.billingDay')
  const tCommon = useTranslations('common')
  const [billingDay, setBillingDay] = useState<string>('')
  const [initialValue, setInitialValue] = useState<string>('')
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    getBillingConfigAction().then((result) => {
      if (result.success && result.data) {
        const value = result.data.billingDay?.toString() ?? ''
        setBillingDay(value)
        setInitialValue(value)
      }
    })
  }, [])

  const hasChanges = billingDay !== initialValue

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const day = parseInt(billingDay, 10)
    if (isNaN(day) || day < 1 || day > 31) return

    startTransition(async () => {
      const result = await updateBillingDayAction({ billingDay: day })
      toastActionResult(result)
      if (result.success) setInitialValue(billingDay)
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex items-end gap-4">
          <div className="flex-1 space-y-2">
            <Label htmlFor="billingDay">{t('label')}</Label>
            <Input
              id="billingDay"
              type="number"
              min={1}
              max={31}
              placeholder={t('placeholder')}
              value={billingDay}
              onChange={(e) => setBillingDay(e.target.value)}
            />
            <p className="text-muted-foreground text-xs">{t('help')}</p>
          </div>
          <Button type="submit" disabled={isPending || !hasChanges}>
            {isPending ? tCommon('saving') : tCommon('save')}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
