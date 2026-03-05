'use client'

import { useCallback, useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import type { Role } from '@prisma/client'
import { Calendar, Loader2, Plus } from 'lucide-react'

import { Badge } from '@/src/shared/ui/badge'
import { Button } from '@/src/shared/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/src/shared/ui/tabs'

import type { ShiftApplicationWithRelations } from '@/src/entities/shift-application'

import { getExtraShiftsForAreaAction } from '../api/extra-shift-queries'
import { getMyApplicationsAction } from '../api/extra-shift-queries'
import { ApplicationForm } from './application-form'

interface ExtraShiftListProps {
  userRole: Role
}

function formatShortDate(date: Date) {
  return new Date(date).toLocaleDateString([], {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

interface ExtraShiftItem {
  id: string
  startTime: Date
  endTime: Date
  coverageStatus: string
  area: { id: string; name: string; color: string }
  shiftType: { id: string; name: string; color: string; icon: string | null }
  _count: { applications: number }
}

export function ExtraShiftList({ userRole: _userRole }: ExtraShiftListProps) {
  const t = useTranslations('extraShifts')
  const [tab, setTab] = useState<'available' | 'applications'>('available')
  const [shifts, setShifts] = useState<ExtraShiftItem[]>([])
  const [applications, setApplications] = useState<ShiftApplicationWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [applyShiftId, setApplyShiftId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    if (tab === 'available') {
      const result = await getExtraShiftsForAreaAction()
      if (result.success && result.data)
        setShifts(result.data.shifts)
    } else {
      const result = await getMyApplicationsAction()
      if (result.success && result.data)
        setApplications(result.data.applications)
    }
    setLoading(false)
  }, [tab])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div className="space-y-4">
      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList>
          <TabsTrigger value="available">{t('available')}</TabsTrigger>
          <TabsTrigger value="applications">{t('myApplications')}</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : tab === 'available' ? (
        shifts.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <Calendar className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">{t('noExtraShifts')}</p>
            <p className="text-xs text-muted-foreground">{t('noExtraShiftsDescription')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {shifts.map((shift) => (
              <div key={shift.id} className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge
                      style={{ backgroundColor: shift.area.color, color: '#fff' }}
                    >
                      {shift.area.name}
                    </Badge>
                    <Badge
                      variant="outline"
                      style={{
                        borderColor: shift.shiftType.color,
                        color: shift.shiftType.color,
                      }}
                    >
                      {shift.shiftType.name}
                    </Badge>
                  </div>
                  <p className="text-sm">
                    {formatShortDate(shift.startTime)} - {formatShortDate(shift.endTime)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t('applicants', { count: shift._count.applications })}
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => setApplyShiftId(shift.id)}
                >
                  <Plus className="mr-1 h-3 w-3" />
                  {t('apply')}
                </Button>
              </div>
            ))}
          </div>
        )
      ) : applications.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
          <Calendar className="h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">{t('noApplications')}</p>
          <p className="text-xs text-muted-foreground">{t('noApplicationsDescription')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => (
            <div key={app.id} className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge
                    style={{ backgroundColor: app.shift.area.color, color: '#fff' }}
                  >
                    {app.shift.area.name}
                  </Badge>
                  <Badge
                    variant="outline"
                    style={{
                      borderColor: app.shift.shiftType.color,
                      color: app.shift.shiftType.color,
                    }}
                  >
                    {app.shift.shiftType.name}
                  </Badge>
                </div>
                <p className="text-sm">
                  {formatShortDate(app.shift.startTime)} - {formatShortDate(app.shift.endTime)}
                </p>
              </div>
              <Badge variant={
                app.status === 'APPROVED' ? 'default' :
                app.status === 'REJECTED' ? 'destructive' :
                'secondary'
              }>
                {t(`status.${app.status}`)}
              </Badge>
            </div>
          ))}
        </div>
      )}

      <ApplicationForm
        open={!!applyShiftId}
        onOpenChange={(open) => { if (!open) setApplyShiftId(null) }}
        shiftId={applyShiftId ?? ''}
        onApplied={load}
      />
    </div>
  )
}
