'use client'

import { startTransition, useCallback, useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { ArrowLeftRight, Check, Clock, Loader2, User, X } from 'lucide-react'
import { toast } from 'sonner'

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
import { Badge } from '@/src/shared/ui/badge'
import { Button } from '@/src/shared/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/src/shared/ui/sheet'

import type { SwapRequestWithRelations } from '@/src/entities/swap'

import { cancelSwapAction, respondToSwapAction } from '../api/swap-actions'
import { selectSwapOfferAction } from '../api/swap-offer-actions'
import { getSwapDetailAction } from '../api/swap-queries'

interface SwapDetailPanelProps {
  requestId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdated?: () => void
}

function formatDateTime(date: Date) {
  return new Date(date).toLocaleString([], {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function SwapDetailPanel({
  requestId,
  open,
  onOpenChange,
  onUpdated,
}: SwapDetailPanelProps) {
  const t = useTranslations('swap')
  const tCommon = useTranslations('common')
  const [data, setData] = useState<SwapRequestWithRelations | null>(null)
  const [loading, setLoading] = useState(false)
  const [acting, setActing] = useState(false)

  const load = useCallback(async (id: string) => {
    setLoading(true)
    setData(null)
    const result = await getSwapDetailAction(id)
    if (result.success && result.data) setData(result.data)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (open && requestId)
      startTransition(() => {
        void load(requestId)
      })
  }, [open, requestId, load])

  const handleRespond = async (accept: boolean) => {
    if (!requestId) return
    setActing(true)
    const result = await respondToSwapAction(requestId, accept)
    if (result.success) {
      toast.success(accept ? t('success.accepted') : t('success.rejected'))
      onUpdated?.()
      onOpenChange(false)
    } else toast.error(result.error)
    setActing(false)
  }

  const handleCancel = async () => {
    if (!requestId) return
    setActing(true)
    const result = await cancelSwapAction(requestId)
    if (result.success) {
      toast.success(t('success.cancelled'))
      onUpdated?.()
      onOpenChange(false)
    } else toast.error(result.error)
    setActing(false)
  }

  const handleSelectOffer = async (offerId: string) => {
    setActing(true)
    const result = await selectSwapOfferAction(offerId)
    if (result.success) {
      toast.success(t('success.offerSelected'))
      onUpdated?.()
      if (requestId) load(requestId)
    } else toast.error(result.error)
    setActing(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{t('detail.title')}</SheetTitle>
          <SheetDescription className="sr-only">{t('detail.title')}</SheetDescription>
        </SheetHeader>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {data && (
          <div className="space-y-6 pt-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{t(`type.${data.type}`)}</Badge>
              <Badge>{t(`status.${data.status}`)}</Badge>
            </div>

            <div className="space-y-4">
              <div className="rounded-lg border p-3 space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>{t('detail.requester')}</span>
                </div>
                <p className="text-sm font-medium">{data.requester.name}</p>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    style={{
                      borderColor: data.requesterShift.shiftType.color,
                      color: data.requesterShift.shiftType.color,
                    }}
                  >
                    {data.requesterShift.shiftType.name}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDateTime(data.requesterShift.startTime)} -{' '}
                    {formatDateTime(data.requesterShift.endTime)}
                  </span>
                </div>
              </div>

              <div className="flex justify-center">
                <ArrowLeftRight className="h-5 w-5 text-muted-foreground" />
              </div>

              {data.targetShift && data.targetUser ? (
                <div className="rounded-lg border p-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>{t('detail.target')}</span>
                  </div>
                  <p className="text-sm font-medium">{data.targetUser.name}</p>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      style={{
                        borderColor: data.targetShift.shiftType.color,
                        color: data.targetShift.shiftType.color,
                      }}
                    >
                      {data.targetShift.shiftType.name}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDateTime(data.targetShift.startTime)} -{' '}
                      {formatDateTime(data.targetShift.endTime)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed p-3 text-center text-sm text-muted-foreground">
                  {data.type === 'OPEN' ? t('noOffers') : t('detail.target')}
                </div>
              )}
            </div>

            {data.reason && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">{t('detail.reason')}</p>
                <p className="text-sm">{data.reason}</p>
              </div>
            )}

            {data.chiefNote && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">{t('detail.chiefNote')}</p>
                <p className="text-sm">{data.chiefNote}</p>
              </div>
            )}

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>
                {t('detail.createdAt')}: {formatDateTime(data.createdAt)}
              </span>
            </div>

            {data.expiresAt && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>
                  {t('detail.expiresAt')}: {formatDateTime(data.expiresAt)}
                </span>
              </div>
            )}

            {data.type === 'OPEN' && data.offers.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium">
                  {t('offers')} ({data.offers.length})
                </h4>
                {data.offers.map((offer) => (
                  <div
                    key={offer.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{offer.offerer.name}</p>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          style={{
                            borderColor: offer.offeredShift.shiftType.color,
                            color: offer.offeredShift.shiftType.color,
                          }}
                        >
                          {offer.offeredShift.shiftType.name}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDateTime(offer.offeredShift.startTime)}
                        </span>
                      </div>
                      {offer.note && <p className="text-xs text-muted-foreground">{offer.note}</p>}
                    </div>
                    {offer.status === 'PENDING' &&
                      (data.status === 'PENDING_PEER' || data.status === 'PENDING_SELECTION') && (
                        <Button
                          size="sm"
                          onClick={() => handleSelectOffer(offer.id)}
                          disabled={acting}
                        >
                          <Check className="mr-1 h-3 w-3" />
                          {t('selectOffer')}
                        </Button>
                      )}
                    {offer.status === 'ACCEPTED' && (
                      <Badge variant="outline">{t('status.APPROVED')}</Badge>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              {data.status === 'PENDING_PEER' && data.type === 'DIRECT' && (
                <>
                  <Button onClick={() => handleRespond(true)} disabled={acting} className="flex-1">
                    <Check className="mr-1 h-4 w-4" />
                    {t('accept')}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleRespond(false)}
                    disabled={acting}
                    className="flex-1"
                  >
                    <X className="mr-1 h-4 w-4" />
                    {t('reject')}
                  </Button>
                </>
              )}

              {['PENDING_PEER', 'PENDING_SELECTION', 'PENDING_CHIEF'].includes(data.status) && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" disabled={acting}>
                      {t('cancel')}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t('cancelConfirm')}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t('cancelConfirmDescription')}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
                      <AlertDialogAction onClick={handleCancel}>{t('cancel')}</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
