'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { AlertTriangle } from 'lucide-react'

import { Alert, AlertDescription } from '@/src/shared/ui/alert'

import { Link } from '@/i18n/navigation'

import { getPendingCompletionCountAction } from '../api/shift-actions'

export function PendingShiftsAlert() {
  const t = useTranslations('shifts')
  const [pending, setPending] = useState<
    Array<{ areaId: string; areaName: string; count: number }>
  >([])

  useEffect(() => {
    getPendingCompletionCountAction().then((result) => {
      if (result.success && result.data) setPending(result.data)
    })
  }, [])

  const totalPending = pending.reduce((sum, p) => sum + p.count, 0)

  if (totalPending === 0) return null

  return (
    <Link href="/dashboard/shifts/calendar">
      <Alert variant="default" className="cursor-pointer hover:bg-muted/50 transition-colors">
        <AlertTriangle className="h-4 w-4" aria-hidden />
        <AlertDescription>
          {t('completion.pendingAlert', { count: totalPending })}
          {pending.length > 1 && (
            <span className="text-muted-foreground ml-1">
              ({pending.map((p) => `${p.areaName}: ${p.count}`).join(', ')})
            </span>
          )}
        </AlertDescription>
      </Alert>
    </Link>
  )
}
