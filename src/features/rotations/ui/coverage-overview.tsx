'use client'

import { useEffect, useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { AlertTriangle } from 'lucide-react'

import { Alert, AlertDescription } from '@/src/shared/ui/alert'
import { Button } from '@/src/shared/ui/button'
import { Skeleton } from '@/src/shared/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/src/shared/ui/tooltip'

import { getCoverageOverviewAction } from '../api/generation-actions'
import type { CoverageOverview } from '../types/rotation-types'
import { ExtrasDialog } from './extras-dialog'

interface CoverageOverviewProps {
  rotationId: string
  areaId: string
}

type ExtrasState = {
  areaId: string
  date: Date
  shiftTypeId: string
  shiftTypeName: string
  shiftStartTime: Date
  shiftEndTime: Date
  rotationGroupId?: string
} | null

function CoverageGridSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-48" />
      <div className="overflow-x-auto">
        <div className="min-w-max space-y-1">
          <div className="flex gap-1">
            <Skeleton className="h-8 w-24 shrink-0" />
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-16 shrink-0" />
            ))}
          </div>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-1">
              <Skeleton className="h-8 w-24 shrink-0" />
              {Array.from({ length: 10 }).map((_, j) => (
                <Skeleton key={j} className="h-8 w-16 shrink-0" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function formatShortDate(date: Date): string {
  const day = date.getUTCDate()
  const month = date.getUTCMonth() + 1
  return `${day}/${month}`
}

export function CoverageOverview({ rotationId, areaId }: CoverageOverviewProps) {
  const t = useTranslations('rotations')
  const [data, setData] = useState<CoverageOverview | null>(null)
  const [isPending, startTransition] = useTransition()
  const [extrasState, setExtrasState] = useState<ExtrasState>(null)
  const [extrasOpen, setExtrasOpen] = useState(false)

  useEffect(() => {
    const today = new Date()
    const startDate = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
    )
    const endDate = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + 30)
    )

    startTransition(async () => {
      const result = await getCoverageOverviewAction(rotationId, startDate, endDate)
      if (result.success && result.data)
        setData(result.data)
    })
  }, [rotationId])

  if (isPending)
    return <CoverageGridSkeleton />

  if (!data)
    return null

  const groupNames = data.days.length > 0
    ? data.days[0].groups.map((g) => ({ id: g.groupId, name: g.groupName }))
    : []

  const dateRangeLabel = t('coverage.dateRange', {
    start: formatShortDate(data.dateRange.start),
    end: formatShortDate(data.dateRange.end),
  })

  return (
    <div className="space-y-4">
      {data.alerts.length > 0 && (
        <div className="space-y-2" role="region" aria-label={t('coverage.alertsTitle')}>
          {data.alerts.slice(0, 5).map((alert) => (
            <Alert
              key={alert.message}
              variant={alert.severity === 'error' ? 'destructive' : 'default'}
            >
              <AlertTriangle className="h-4 w-4" aria-hidden />
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      <p className="text-muted-foreground text-xs">{dateRangeLabel}</p>

      <div className="overflow-x-auto">
        <table className="min-w-max border-separate border-spacing-0.5 text-xs">
          <thead>
            <tr>
              <th className="bg-background sticky left-0 z-10 min-w-24 px-2 py-1.5 text-left font-medium">
                {t('coverage.group')}
              </th>
              {data.days.map((day) => (
                <th
                  key={day.date.toISOString()}
                  className={[
                    'min-w-16 px-1 py-1.5 text-center font-normal',
                    day.hasGap ? 'text-destructive' : 'text-muted-foreground',
                  ].join(' ')}
                >
                  {formatShortDate(day.date)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groupNames.map((group) => (
              <tr key={group.id}>
                <td className="bg-background sticky left-0 z-10 px-2 py-1 font-medium">
                  {group.name}
                </td>
                {data.days.map((day) => {
                  const dayKey = day.date.toISOString()
                  const groupData = day.groups.find((g) => g.groupId === group.id)

                  if (!groupData)
                    return <td key={dayKey} className="px-1 py-1" />

                  if (groupData.stepType === 'rest')
                    return (
                      <td
                        key={dayKey}
                        className={[
                          'rounded px-1 py-1 text-center',
                          day.hasGap ? 'bg-destructive/10' : '',
                        ].join(' ')}
                      >
                        <span className="text-muted-foreground">{t('coverage.rest')}</span>
                      </td>
                    )

                  if (!groupData.shiftType)
                    return <td key={dayKey} className="px-1 py-1" />

                  const cellContent = (
                    <span
                      className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-white"
                      style={{ backgroundColor: groupData.shiftType.color }}
                    >
                      {groupData.shiftType.name}
                      {groupData.isUnderstaffed && (
                        <AlertTriangle
                          className="h-3 w-3"
                          aria-label={t('coverage.understaffed')}
                        />
                      )}
                    </span>
                  )

                  if (groupData.isUnderstaffed)
                    return (
                      <td
                        key={dayKey}
                        className={[
                          'rounded px-1 py-1 text-center',
                          day.hasGap ? 'bg-destructive/10' : '',
                        ].join(' ')}
                      >
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-auto p-0 hover:bg-transparent"
                                onClick={() => {
                                  const dayStart = new Date(Date.UTC(
                                    day.date.getUTCFullYear(),
                                    day.date.getUTCMonth(),
                                    day.date.getUTCDate(),
                                  ))
                                  const dayEnd = new Date(Date.UTC(
                                    day.date.getUTCFullYear(),
                                    day.date.getUTCMonth(),
                                    day.date.getUTCDate(),
                                    23, 59,
                                  ))
                                  setExtrasState({
                                    areaId,
                                    date: day.date,
                                    shiftTypeId: groupData.shiftType!.id,
                                    shiftTypeName: groupData.shiftType!.name,
                                    shiftStartTime: dayStart,
                                    shiftEndTime: dayEnd,
                                    rotationGroupId: group.id,
                                  })
                                  setExtrasOpen(true)
                                }}
                                aria-label={t('extras.fillWithExtra')}
                              >
                                {cellContent}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{t('coverage.understaffed')}</p>
                              <p>
                                {t('coverage.staffCount', {
                                  current: groupData.memberCount,
                                  required: groupData.minStaffRequired,
                                })}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {t('extras.fillWithExtra')}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </td>
                    )

                  return (
                    <td
                      key={dayKey}
                      className={[
                        'rounded px-1 py-1 text-center',
                        day.hasGap ? 'bg-destructive/10' : '',
                      ].join(' ')}
                    >
                      {cellContent}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.alerts.length === 0 && (
        <p className="text-muted-foreground text-xs">{t('coverage.noAlerts')}</p>
      )}

      {extrasState && (
        <ExtrasDialog
          open={extrasOpen}
          onOpenChange={(isOpen) => {
            setExtrasOpen(isOpen)
            if (!isOpen) setExtrasState(null)
          }}
          areaId={extrasState.areaId}
          date={extrasState.date}
          shiftTypeId={extrasState.shiftTypeId}
          shiftTypeName={extrasState.shiftTypeName}
          shiftStartTime={extrasState.shiftStartTime}
          shiftEndTime={extrasState.shiftEndTime}
          rotationGroupId={extrasState.rotationGroupId}
          rotationId={rotationId}
          onAssigned={() => {
            setExtrasState(null)
            const today = new Date()
            const startDate = new Date(
              Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
            )
            const endDate = new Date(
              Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + 30)
            )
            startTransition(async () => {
              const result = await getCoverageOverviewAction(rotationId, startDate, endDate)
              if (result.success && result.data)
                setData(result.data)
            })
          }}
        />
      )}
    </div>
  )
}
