'use client'

import { useCallback, useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Copy, Download, Link, Loader2, Rss, Trash2 } from 'lucide-react'

import { Badge } from '@/src/shared/ui/badge'
import { Button } from '@/src/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/src/shared/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/src/shared/ui/dropdown-menu'

import {
  createFeedTokenAction,
  generateIcsFileAction,
  getMyFeedTokensAction,
  revokeFeedTokenAction,
} from '../api/ical-actions'

interface CalendarExportMenuProps {
  currentMonth: number
  currentYear: number
}

interface FeedToken {
  id: string
  organizationId: string | null
  organizationName: string | null
  feedUrl: string
  isActive: boolean
  createdAt: Date
}

export function CalendarExportMenu({
  currentMonth,
  currentYear,
}: CalendarExportMenuProps) {
  const t = useTranslations('staffDashboard.export')
  const [isPending, startTransition] = useTransition()
  const [feedDialogOpen, setFeedDialogOpen] = useState(false)
  const [feeds, setFeeds] = useState<FeedToken[]>([])

  const handleDownloadIcs = useCallback(() => {
    const toastId = toast.loading(t('downloading'))
    startTransition(async () => {
      const result = await generateIcsFileAction({
        month: currentMonth,
        year: currentYear,
      })
      if (result.success && result.data) {
        const blob = new Blob([result.data.icsContent], {
          type: 'text/calendar',
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = result.data.filename
        a.click()
        URL.revokeObjectURL(url)
        toast.success(t('downloadSuccess'), { id: toastId })
      } else
        toast.error(t('downloadError'), { id: toastId })
    })
  }, [currentMonth, currentYear, t])

  const handleCreateFeed = useCallback(
    (type: 'per-org' | 'unified') => {
      startTransition(async () => {
        const result = await createFeedTokenAction({ type })
        if (result.success && result.data) {
          await navigator.clipboard.writeText(result.data.feedUrl)
          toast.success(t('feedCreated'), { description: t('urlCopied') })
          const feedsResult = await getMyFeedTokensAction()
          if (feedsResult.success && feedsResult.data)
            setFeeds(feedsResult.data.tokens)
        }
      })
    },
    [t]
  )

  const handleManageFeeds = useCallback(() => {
    startTransition(async () => {
      const result = await getMyFeedTokensAction()
      if (result.success && result.data)
        setFeeds(result.data.tokens)
      setFeedDialogOpen(true)
    })
  }, [])

  const handleRevokeFeed = useCallback(
    (tokenId: string) => {
      startTransition(async () => {
        const revokeResult = await revokeFeedTokenAction({ tokenId })
        if (revokeResult.success) toast.success(t('feedRevoked'))
        else toast.error(revokeResult.error ?? t('revokeError'))
        const result = await getMyFeedTokensAction()
        if (result.success && result.data)
          setFeeds(result.data.tokens)
      })
    },
    [t]
  )

  const handleCopyUrl = useCallback(
    async (url: string) => {
      await navigator.clipboard.writeText(url)
      toast.success(t('urlCopied'))
    },
    [t]
  )

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={isPending}>
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            {t('button')}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{t('button')}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleDownloadIcs}>
            <Download className="mr-2 h-4 w-4" />
            {t('downloadIcs')}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleCreateFeed('per-org')}>
            <Link className="mr-2 h-4 w-4" />
            {t('feedPerOrg')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleCreateFeed('unified')}>
            <Rss className="mr-2 h-4 w-4" />
            {t('feedUnified')}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleManageFeeds}>
            {t('manageFeeds')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={feedDialogOpen} onOpenChange={setFeedDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('manageFeeds')}</DialogTitle>
            <DialogDescription>{t('feedUrl')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {feeds.filter((f) => f.isActive).length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                {t('noFeeds')}
              </p>
            ) : (
              feeds
                .filter((f) => f.isActive)
                .map((feed) => (
                  <div
                    key={feed.id}
                    className="flex items-center gap-2 rounded-md border p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <Badge variant="outline" className="mb-1">
                        {feed.organizationName ?? t('unifiedLabel')}
                      </Badge>
                      <p className="truncate text-xs text-muted-foreground">
                        {feed.feedUrl}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopyUrl(feed.feedUrl)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRevokeFeed(feed.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
