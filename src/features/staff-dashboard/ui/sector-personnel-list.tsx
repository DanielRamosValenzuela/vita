'use client'

import { useTranslations } from 'next-intl'
import { ArrowRightLeft, Users } from 'lucide-react'

import { Badge } from '@/src/shared/ui/badge'

import type { SectorAreaPersonnel } from '../types/staff-dashboard-types'

interface SectorPersonnelListProps {
  areas: SectorAreaPersonnel[]
  totalStaff: number
  sectorName: string | null
}

function formatTime(date: Date) {
  return new Date(date).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function SectorPersonnelList({ areas, totalStaff, sectorName }: SectorPersonnelListProps) {
  const t = useTranslations('staffDashboard.personnel')

  if (areas.length === 0)
    return (
      <div className="flex flex-col items-center gap-2 py-6 text-center">
        <Users className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{t('noPersonnel')}</p>
      </div>
    )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{sectorName ? t('title') : t('titleNoSector')}</h3>
        <Badge variant="secondary">{t('totalStaff', { count: totalStaff })}</Badge>
      </div>

      <div className="space-y-3">
        {areas.map((areaEntry) => (
          <div key={areaEntry.area.id} className="rounded-lg border p-3">
            <div className="mb-2 flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: areaEntry.area.color }}
              />
              <span className="text-sm font-medium">{areaEntry.area.name}</span>
              <Badge variant="outline" className="ml-auto text-xs">
                {areaEntry.shifts.length}
              </Badge>
            </div>

            <div className="space-y-1.5">
              {areaEntry.shifts.map((shift) => (
                <div
                  key={shift.id}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/50"
                >
                  <span className="flex-1 truncate font-medium">{shift.userName}</span>
                  <Badge
                    variant="outline"
                    className="text-xs"
                    style={{
                      borderColor: shift.shiftTypeColor,
                      color: shift.shiftTypeColor,
                    }}
                  >
                    {shift.shiftTypeName}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                  </span>
                  {shift.relay && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <ArrowRightLeft className="h-3 w-3" />
                      {shift.relay.type === 'incoming'
                        ? t('relayIncoming', { name: shift.relay.userName })
                        : t('relayOutgoing', { name: shift.relay.userName })}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
