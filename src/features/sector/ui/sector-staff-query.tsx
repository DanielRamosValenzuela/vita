'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { format } from 'date-fns'
import { Star } from 'lucide-react'
import { toast } from 'sonner'

import { Spinner } from '@/src/shared/ui/atoms'
import { Badge } from '@/src/shared/ui/badge'
import { Button } from '@/src/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/shared/ui/card'
import { IconDisplay } from '@/src/shared/ui/icon-picker'
import { Input } from '@/src/shared/ui/input'
import { Label } from '@/src/shared/ui/label'

import { getSectorStaffAction } from '../api'
import type { SectorStaffResult } from '../api'

const DEFAULT_AREA_ICON = 'Building2'

interface SectorStaffQueryProps {
  sectorId: string
}

export function SectorStaffQuery({ sectorId }: SectorStaffQueryProps) {
  const t = useTranslations('adminHR.sectors.staffQuery')
  const [isPending, startTransition] = useTransition()

  const today = format(new Date(), 'yyyy-MM-dd')
  const [date, setDate] = useState(today)
  const [startTime, setStartTime] = useState('08:00')
  const [endTime, setEndTime] = useState('20:00')
  const [result, setResult] = useState<SectorStaffResult | null>(null)

  const handleSearch = () => {
    startTransition(async () => {
      const response = await getSectorStaffAction({
        sectorId,
        date,
        startTime,
        endTime,
      })
      if (response.success && response.data)
        setResult(response.data as SectorStaffResult)
       else
        toast.error(response.error)
      
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">{t('dateLabel')}</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startTime">{t('startTimeLabel')}</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">{t('endTimeLabel')}</Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
            <Button onClick={handleSearch} disabled={isPending}>
              {isPending && <Spinner size="sm" className="mr-2" />}
              {isPending ? t('searching') : t('searchButton')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <>
          {result.areas.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <p className="text-muted-foreground text-center">{t('noResults')}</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <p className="text-muted-foreground text-sm">
                {t('totalStaff', { count: result.totalStaff })}
              </p>
              {result.areas.map((areaGroup) => (
                <Card key={areaGroup.area.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <span style={{ color: areaGroup.area.color }}>
                        <IconDisplay
                          iconName={areaGroup.area.icon ?? DEFAULT_AREA_ICON}
                          size={18}
                        />
                      </span>
                      {areaGroup.area.name}
                      <Badge variant="secondary" className="ml-auto">
                        {areaGroup.shifts.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {areaGroup.shifts.map((shift) => (
                        <div
                          key={shift.id}
                          className="flex items-center gap-3 rounded-md border px-3 py-2"
                        >
                          <div
                            className="h-3 w-3 shrink-0 rounded-full"
                            style={{ backgroundColor: shift.shiftTypeColor }}
                          />
                          <span className="font-medium">{shift.userName}</span>
                          <Badge variant="outline" className="text-xs">
                            {shift.shiftTypeName}
                          </Badge>
                          {shift.isExtra && (
                            <Badge
                              variant="outline"
                              className="border-amber-400 text-xs text-amber-600"
                            >
                              <Star className="mr-1 h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                              {t('extraBadge')}
                            </Badge>
                          )}
                          <span className="text-muted-foreground ml-auto text-sm">
                            {format(new Date(shift.startTime), 'HH:mm')}
                            {' - '}
                            {format(new Date(shift.endTime), 'HH:mm')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </>
      )}
    </div>
  )
}
