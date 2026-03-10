'use client'

import { startTransition, useCallback, useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { ArrowLeftRight, Clock, Loader2, MapPin, Star } from 'lucide-react'

import { Badge } from '@/src/shared/ui/badge'
import { Button } from '@/src/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/src/shared/ui/dialog'
import { formatDateTime } from '@/src/shared/lib/utils/format'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/src/shared/ui/sheet'
import { OpenSwapForm } from '@/src/features/shift-swap/ui/open-swap-form'
import { SwapRequestForm } from '@/src/features/shift-swap/ui/swap-request-form'

import { getSectorPersonnelForShiftAction } from '../api/sector-personnel-actions'
import type { SectorPersonnelResult } from '../types/staff-dashboard-types'
import { SectorPersonnelList } from './sector-personnel-list'

interface ShiftDetailPanelProps {
  shiftId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  currentUserId?: string
}


export function ShiftDetailPanel({
  shiftId,
  open,
  onOpenChange,
  currentUserId,
}: ShiftDetailPanelProps) {
  const t = useTranslations('staffDashboard')
  const tSwap = useTranslations('swap')
  const [data, setData] = useState<SectorPersonnelResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeDialog, setActiveDialog] = useState<'options' | 'direct' | 'open' | null>(null)

  const fetchPersonnel = useCallback(async (id: string) => {
    setLoading(true)
    setData(null)
    const result = await getSectorPersonnelForShiftAction({ shiftId: id })
    if (result.success && result.data) setData(result.data)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (open && shiftId)
      startTransition(() => {
        void fetchPersonnel(shiftId)
      })
  }, [open, shiftId, fetchPersonnel])

  const isNightShift =
    data?.shift &&
    new Date(data.shift.endTime).getDate() !== new Date(data.shift.startTime).getDate()

  const [canRequestSwap, setCanRequestSwap] = useState(false)

  useEffect(() => {
    if (currentUserId && data?.shift) {
      const threshold = Date.now() + 24 * 60 * 60 * 1000
      startTransition(() =>
        setCanRequestSwap(
          data.shift.status === 'SCHEDULED' && new Date(data.shift.startTime).getTime() > threshold
        )
      )
    } else startTransition(() => setCanRequestSwap(false))
  }, [currentUserId, data])

  const shiftDateStr = data?.shift ? formatDateTime(data.shift.startTime) : ''

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{t('shiftDetail.title')}</SheetTitle>
            <SheetDescription className="sr-only">{t('shiftDetail.title')}</SheetDescription>
          </SheetHeader>

          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">{t('personnel.loading')}</span>
            </div>
          )}

          {data && (
            <div className="space-y-6 pt-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{t('shiftDetail.area')}</span>
                  <Badge
                    style={{
                      backgroundColor: data.shift.area.color,
                      color: '#fff',
                    }}
                  >
                    {data.shift.area.name}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {t('shiftDetail.shiftType')}
                  </span>
                  <Badge
                    variant="outline"
                    style={{
                      borderColor: data.shift.shiftType.color,
                      color: data.shift.shiftType.color,
                    }}
                  >
                    {data.shift.shiftType.name}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{t('shiftDetail.schedule')}</span>
                  <span className="text-sm font-medium">
                    {formatDateTime(data.shift.startTime)} - {formatDateTime(data.shift.endTime)}
                  </span>
                </div>

                {isNightShift && (
                  <p className="text-xs text-muted-foreground italic">
                    {t('shiftDetail.nightShift')}
                  </p>
                )}

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{t('shiftDetail.status')}</span>
                  <Badge variant="secondary">{t(`status.${data.shift.status}`)}</Badge>
                </div>

                {data.shift.rotation && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {t('shiftDetail.rotation')}
                    </span>
                    <span className="text-sm">{data.shift.rotation.name}</span>
                  </div>
                )}

                {data.shift.isExtra && (
                  <Badge variant="destructive">{t('shiftDetail.extra')}</Badge>
                )}

                {canRequestSwap && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 w-full"
                    onClick={() => setActiveDialog('options')}
                  >
                    <ArrowLeftRight className="mr-2 h-4 w-4" />
                    {tSwap('requestSwap')}
                  </Button>
                )}
              </div>

              <hr />

              <SectorPersonnelList
                areas={data.areas}
                totalStaff={data.totalStaff}
                sectorName={data.sector?.name ?? null}
              />
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Dialog
        open={activeDialog === 'options'}
        onOpenChange={(open) => {
          if (!open) setActiveDialog(null)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{tSwap('swapOptions')}</DialogTitle>
            <DialogDescription>{tSwap('swapOptionsDescription')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <button
              type="button"
              className="w-full rounded-lg border p-4 text-left transition-colors hover:bg-muted/50"
              onClick={() => setActiveDialog('direct')}
            >
              <p className="text-sm font-medium">{tSwap('directSwap')}</p>
              <p className="text-xs text-muted-foreground">{tSwap('directSwapDescription')}</p>
            </button>
            <button
              type="button"
              className="w-full rounded-lg border p-4 text-left transition-colors hover:bg-muted/50"
              onClick={() => setActiveDialog('open')}
            >
              <p className="text-sm font-medium">{tSwap('openSwap')}</p>
              <p className="text-xs text-muted-foreground">{tSwap('openSwapDescription')}</p>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {data?.shift && shiftId && (
        <>
          <SwapRequestForm
            open={activeDialog === 'direct'}
            onOpenChange={(open) => {
              if (!open) setActiveDialog(null)
            }}
            requesterShiftId={shiftId}
            areaId={data.shift.area.id}
            shiftTypeName={data.shift.shiftType.name}
            shiftDate={shiftDateStr}
          />
          <OpenSwapForm
            open={activeDialog === 'open'}
            onOpenChange={(open) => {
              if (!open) setActiveDialog(null)
            }}
            requesterShiftId={shiftId}
            shiftTypeName={data.shift.shiftType.name}
            shiftDate={shiftDateStr}
          />
        </>
      )}
    </>
  )
}
