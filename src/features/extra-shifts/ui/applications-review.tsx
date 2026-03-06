'use client'

import { startTransition, useCallback, useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Check, Loader2, X } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/src/shared/ui/badge'
import { Button } from '@/src/shared/ui/button'

import { getExtraShiftsForAreaAction } from '../api/extra-shift-queries'
import { getApplicationsForShiftAction } from '../api/extra-shift-queries'
import { approveApplicationAction, rejectApplicationAction } from '../api/application-actions'
import type { ShiftApplicationWithRelations } from '@/src/entities/shift-application'

function formatShortDate(date: Date) {
  return new Date(date).toLocaleDateString([], {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

interface ShiftWithApplications {
  shiftId: string
  shiftType: string
  shiftTypeColor: string
  areaName: string
  areaColor: string
  startTime: Date
  endTime: Date
  applications: ShiftApplicationWithRelations[]
}

export function ApplicationsReview() {
  const t = useTranslations('extraShifts')
  const [data, setData] = useState<ShiftWithApplications[]>([])
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const shiftsResult = await getExtraShiftsForAreaAction()
    if (!shiftsResult.success || !shiftsResult.data) {
      setLoading(false)
      return
    }

    const shiftsWithPending = shiftsResult.data.shifts.filter(
      (s) => s._count.applications > 0
    )

    const results = await Promise.all(
      shiftsWithPending.map(async (shift) => {
        const appsResult = await getApplicationsForShiftAction(shift.id)
        return {
          shiftId: shift.id,
          shiftType: shift.shiftType.name,
          shiftTypeColor: shift.shiftType.color,
          areaName: shift.area.name,
          areaColor: shift.area.color,
          startTime: shift.startTime,
          endTime: shift.endTime,
          applications: appsResult.success && appsResult.data
            ? appsResult.data.applications.filter((a) => a.status === 'PENDING')
            : [],
        }
      })
    )

    setData(results.filter((r) => r.applications.length > 0))
    setLoading(false)
  }, [])

  useEffect(() => {
    startTransition(() => { void load() })
  }, [load])

  const handleApprove = async (applicationId: string) => {
    setActing(true)
    const result = await approveApplicationAction(applicationId)
    if (result.success) {
      toast.success(t('success.approved'))
      load()
    } else
      toast.error(result.error)
    setActing(false)
  }

  const handleReject = async (applicationId: string) => {
    setActing(true)
    const result = await rejectApplicationAction(applicationId)
    if (result.success) {
      toast.success(t('success.rejected'))
      load()
    } else
      toast.error(result.error)
    setActing(false)
  }

  if (loading)
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )

  if (data.length === 0) return null

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{t('title')}</h3>

      <div className="space-y-4">
        {data.map((shift) => (
          <div key={shift.shiftId} className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Badge style={{ backgroundColor: shift.areaColor, color: '#fff' }}>
                {shift.areaName}
              </Badge>
              <Badge
                variant="outline"
                style={{ borderColor: shift.shiftTypeColor, color: shift.shiftTypeColor }}
              >
                {shift.shiftType}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {formatShortDate(shift.startTime)}
              </span>
            </div>

            <div className="space-y-2">
              {shift.applications.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between rounded border p-2"
                >
                  <div>
                    <p className="text-sm font-medium">{app.user.name}</p>
                    {app.note && (
                      <p className="text-xs text-muted-foreground">{app.note}</p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleApprove(app.id)}
                      disabled={acting}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleReject(app.id)}
                      disabled={acting}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
