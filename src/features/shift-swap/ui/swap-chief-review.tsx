'use client'

import { useCallback, useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { ArrowLeftRight, Check, Loader2, X } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/src/shared/ui/badge'
import { Button } from '@/src/shared/ui/button'
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
import { Label } from '@/src/shared/ui/label'
import { Textarea } from '@/src/shared/ui/textarea'

import type { SwapRequestWithRelations } from '@/src/entities/swap'

import { getPendingChiefSwapsAction } from '../api/swap-queries'
import { reviewSwapAction } from '../api/swap-chief-actions'

function formatShortDate(date: Date) {
  return new Date(date).toLocaleDateString([], {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function SwapChiefReview() {
  const t = useTranslations('swap')
  const [requests, setRequests] = useState<SwapRequestWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState(false)
  const [rejectNote, setRejectNote] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const result = await getPendingChiefSwapsAction()
    if (result.success && result.data)
      setRequests(result.data.requests)
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleReview = async (requestId: string, approve: boolean, note?: string) => {
    setActing(true)
    const result = await reviewSwapAction(requestId, approve, note)
    if (result.success) {
      toast.success(approve ? t('success.approved') : t('success.rejected'))
      load()
    } else
      toast.error(result.error)
    setActing(false)
    setRejectNote('')
  }

  if (loading)
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )

  if (requests.length === 0) return null

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{t('detail.title')}</h3>

      <div className="space-y-3">
        {requests.map((req) => (
          <div key={req.id} className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {req.requester.name}
                </span>
                <span className="text-muted-foreground">{String.fromCharCode(0x21C4)}</span>
                <span className="text-sm font-medium">
                  {req.targetUser?.name}
                </span>
              </div>
              <Badge>{t(`type.${req.type}`)}</Badge>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded border p-2 space-y-1">
                <p className="text-xs text-muted-foreground">{req.requester.name}</p>
                <Badge
                  variant="outline"
                  style={{
                    borderColor: req.requesterShift.shiftType.color,
                    color: req.requesterShift.shiftType.color,
                  }}
                >
                  {req.requesterShift.shiftType.name}
                </Badge>
                <p className="text-xs">
                  {formatShortDate(req.requesterShift.startTime)}
                </p>
              </div>

              {req.targetShift && (
                <div className="rounded border p-2 space-y-1">
                  <p className="text-xs text-muted-foreground">{req.targetUser?.name}</p>
                  <Badge
                    variant="outline"
                    style={{
                      borderColor: req.targetShift.shiftType.color,
                      color: req.targetShift.shiftType.color,
                    }}
                  >
                    {req.targetShift.shiftType.name}
                  </Badge>
                  <p className="text-xs">
                    {formatShortDate(req.targetShift.startTime)}
                  </p>
                </div>
              )}
            </div>

            {req.reason && (
              <p className="text-xs text-muted-foreground">{t('detail.reason')}: {req.reason}</p>
            )}

            <div className="flex gap-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" disabled={acting}>
                    <Check className="mr-1 h-3 w-3" />
                    {t('approve')}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t('approveConfirm')}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t('approveConfirmDescription')}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleReview(req.id, true)}>
                      {t('approve')}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="destructive" disabled={acting}>
                    <X className="mr-1 h-3 w-3" />
                    {t('reject')}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t('reject')}</AlertDialogTitle>
                    <AlertDialogDescription>
                      <div className="space-y-2 pt-2">
                        <Label htmlFor={`reject-note-${req.id}`}>{t('rejectNote')}</Label>
                        <Textarea
                          id={`reject-note-${req.id}`}
                          value={rejectNote}
                          onChange={(e) => setRejectNote(e.target.value)}
                          placeholder={t('rejectNotePlaceholder')}
                        />
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setRejectNote('')}>
                      {t('cancel')}
                    </AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleReview(req.id, false, rejectNote)}>
                      {t('reject')}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
