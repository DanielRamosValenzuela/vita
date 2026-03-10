'use client'

import { startTransition, useCallback, useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { ArrowLeftRight, Loader2 } from 'lucide-react'

import { formatShortDate } from '@/src/shared/lib/utils/format'
import { Badge } from '@/src/shared/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/src/shared/ui/tabs'

import type { SwapRequestWithRelations } from '@/src/entities/swap'

import { getMySwapRequestsAction } from '../api/swap-queries'
import { SwapDetailPanel } from './swap-detail-panel'


const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  PENDING_PEER: 'default',
  PENDING_SELECTION: 'default',
  PENDING_CHIEF: 'secondary',
  APPROVED: 'outline',
  REJECTED_BY_PEER: 'destructive',
  REJECTED_BY_CHIEF: 'destructive',
  CANCELLED: 'secondary',
  EXPIRED: 'secondary',
}

export function SwapList() {
  const t = useTranslations('swap')
  const tReq = useTranslations('requests')
  const [requests, setRequests] = useState<SwapRequestWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'sent' | 'received' | 'open'>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const loadRequests = useCallback(async () => {
    setLoading(true)
    const result = await getMySwapRequestsAction(filter === 'all' ? undefined : { type: filter })
    if (result.success && result.data) setRequests(result.data.requests)
    setLoading(false)
  }, [filter])

  useEffect(() => {
    startTransition(() => {
      void loadRequests()
    })
  }, [loadRequests])

  return (
    <div className="space-y-4">
      <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
        <TabsList>
          <TabsTrigger value="all">{tReq('filters.all')}</TabsTrigger>
          <TabsTrigger value="sent">{tReq('filters.sent')}</TabsTrigger>
          <TabsTrigger value="received">{tReq('filters.received')}</TabsTrigger>
          <TabsTrigger value="open">{tReq('filters.open')}</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
          <ArrowLeftRight className="h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            {tReq(`empty.${filter === 'all' ? 'description' : filter}`)}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <button
              key={req.id}
              type="button"
              onClick={() => setSelectedId(req.id)}
              className="w-full rounded-lg border p-4 text-left transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{req.requesterShift.shiftType.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {formatShortDate(req.requesterShift.startTime)}
                    </span>
                    {req.targetShift && (
                      <>
                        <span className="text-muted-foreground">{String.fromCharCode(0x21c4)}</span>
                        <span className="text-sm font-medium">
                          {req.targetShift.shiftType.name}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {formatShortDate(req.targetShift.startTime)}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {t(`type.${req.type}`)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {req.requester.name}
                      {req.targetUser ? ` → ${req.targetUser.name}` : ''}
                    </span>
                    {req.type === 'OPEN' && req.offers.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        ({req.offers.length} {t('offers').toLowerCase()})
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={STATUS_VARIANT[req.status] ?? 'secondary'}>
                    {t(`status.${req.status}`)}
                  </Badge>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <SwapDetailPanel
        requestId={selectedId}
        open={!!selectedId}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null)
        }}
        onUpdated={loadRequests}
      />
    </div>
  )
}
