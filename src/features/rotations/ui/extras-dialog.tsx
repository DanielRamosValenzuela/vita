'use client'

import { useEffect, useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { AlertTriangle, Loader2 } from 'lucide-react'

import { Alert, AlertDescription } from '@/src/shared/ui/alert'
import { Badge } from '@/src/shared/ui/badge'
import { Button } from '@/src/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/src/shared/ui/dialog'
import { Skeleton } from '@/src/shared/ui/skeleton'
import { toastActionResult } from '@/src/shared/lib/utils/toast-action-result'

import { assignExtraShiftAction, getExtraCandidatesAction } from '../api/extras-actions'
import type { ExtraCandidate, GetExtraCandidatesResult } from '../types/rotation-types'

interface ExtrasDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  areaId: string
  date: Date
  shiftTypeId: string
  shiftTypeName: string
  shiftStartTime: Date
  shiftEndTime: Date
  rotationGroupId?: string
  rotationId?: string
  onAssigned: () => void
}

function getTierVariant(tier: string): 'default' | 'secondary' | 'outline' | 'destructive' {
  if (tier === 'TIER_1') return 'default'
  if (tier === 'TIER_2') return 'secondary'
  if (tier === 'TIER_3') return 'outline'
  return 'destructive'
}

function getTierLabel(tier: string, t: ReturnType<typeof useTranslations<'rotations'>>): string {
  if (tier === 'TIER_1') return t('extras.tier1')
  if (tier === 'TIER_2') return t('extras.tier2')
  if (tier === 'TIER_3') return t('extras.tier3')
  return t('extras.neverRecommend')
}

function CandidatesSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-2 rounded-lg border p-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-5 w-20" />
          </div>
          <Skeleton className="h-3 w-48" />
          <Skeleton className="h-8 w-28" />
        </div>
      ))}
    </div>
  )
}

interface CandidateCardProps {
  candidate: ExtraCandidate
  onAssign: (userId: string) => void
  isPending: boolean
  assigningUserId: string | null
  t: ReturnType<typeof useTranslations<'rotations'>>
}

function CandidateCard({ candidate, onAssign, isPending, assigningUserId, t }: CandidateCardProps) {
  const isAssigningThis = assigningUserId === candidate.userId
  const isDisabled = isPending

  return (
    <div className="rounded-lg border p-3 space-y-2">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{candidate.userName}</span>
          <Badge variant={getTierVariant(candidate.tier)}>
            {getTierLabel(candidate.tier, t)}
          </Badge>
          {!candidate.isFromSameArea && (
            <Badge variant="outline" className="text-xs">
              {t('extras.crossArea')}
            </Badge>
          )}
        </div>
        <Button
          size="sm"
          variant={candidate.tier === 'NEVER_RECOMMEND' ? 'destructive' : 'default'}
          disabled={isDisabled}
          onClick={() => onAssign(candidate.userId)}
          aria-label={t('extras.assignConfirm', { name: candidate.userName })}
        >
          {isAssigningThis ? (
            <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
          ) : null}
          {t('extras.assign')}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        {candidate.currentShift
          ? t('extras.extendingFromShift')
          : candidate.currentStatus === 'libre_from_noche'
            ? t('extras.comingOffNight')
            : t('extras.restedAvailable')}
      </p>

      {candidate.warnings.length > 0 && (
        <div className="space-y-1">
          {candidate.warnings.map((warning, i) => (
            <Alert
              key={i}
              variant={warning.severity === 'error' ? 'destructive' : 'default'}
              className="py-1.5 px-3"
            >
              <AlertTriangle className="h-3 w-3" aria-hidden />
              <AlertDescription className="text-xs">{warning.message}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}
    </div>
  )
}

export function ExtrasDialog({
  open,
  onOpenChange,
  areaId,
  date,
  shiftTypeId,
  shiftTypeName,
  shiftStartTime,
  shiftEndTime,
  rotationGroupId,
  rotationId,
  onAssigned,
}: ExtrasDialogProps) {
  const t = useTranslations('rotations')
  const [result, setResult] = useState<GetExtraCandidatesResult | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isLoading, startLoadTransition] = useTransition()
  const [isPending, startAssignTransition] = useTransition()
  const [assigningUserId, setAssigningUserId] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setResult(null)
    setLoadError(null)
    startLoadTransition(async () => {
      const res = await getExtraCandidatesAction({
        areaId,
        date,
        shiftTypeId,
        rotationGroupId,
      })
      if (res.success && res.data)
        setResult(res.data)
      else
        setLoadError(res.error ?? t('loadError'))
    })
  }, [open, areaId, date, shiftTypeId, rotationGroupId, t])

  const handleAssign = (userId: string) => {
    setAssigningUserId(userId)
    startAssignTransition(async () => {
      const res = await assignExtraShiftAction({
        userId,
        areaId,
        shiftTypeId,
        startTime: shiftStartTime,
        endTime: shiftEndTime,
        rotationId,
      })
      toastActionResult(res, {
        successMessage: t('extras.assigned'),
      })
      if (res.success) {
        setAssigningUserId(null)
        onOpenChange(false)
        onAssigned()
      } else
        setAssigningUserId(null)
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {t('extras.dialogTitle', { shiftTypeName })}
          </DialogTitle>
          <DialogDescription>{t('extras.dialogDescription')}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {result && (
            <Alert variant={result.understaffingGap > 0 ? 'destructive' : 'default'}>
              <AlertTriangle className="h-4 w-4" aria-hidden />
              <AlertDescription>
                {t('extras.understaffingGap', {
                  current: result.shiftType.currentStaffCount,
                  required: result.shiftType.minStaffRequired,
                })}
              </AlertDescription>
            </Alert>
          )}

          {isLoading && <CandidatesSkeleton />}

          {loadError && !isLoading && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" aria-hidden />
              <AlertDescription>{loadError}</AlertDescription>
            </Alert>
          )}

          {!isLoading && !loadError && result && result.candidates.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              {t('extras.noCandidates')}
            </p>
          )}

          {!isLoading && !loadError && result && result.candidates.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">
                {t('extras.candidates')}
              </p>
              {result.candidates.map((candidate) => (
                <CandidateCard
                  key={candidate.userId}
                  candidate={candidate}
                  onAssign={handleAssign}
                  isPending={isPending}
                  assigningUserId={assigningUserId}
                  t={t}
                />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
