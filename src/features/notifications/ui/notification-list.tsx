'use client'

import { useTransition } from 'react'
import type { NotificationType } from '@prisma/client'
import { useTranslations } from 'next-intl'
import { Inbox } from 'lucide-react'

import { Button } from '@/src/shared/ui/button'

import type { NotificationWithActor } from '@/src/entities/notification/lib/types'
import { getNotificationsAction } from '@/src/features/notifications/api'

import { NotificationItem } from './notification-item'

interface NotificationListProps {
  notifications: NotificationWithActor[]
  nextCursor: string | null
  filter?: 'all' | 'unread' | 'read'
  activeTypes?: NotificationType[]
  onLoadMore: (notifications: NotificationWithActor[], nextCursor: string | null) => void
  onDelete: (id: string) => void
}

export function NotificationList({
  notifications,
  nextCursor,
  filter,
  activeTypes,
  onLoadMore,
  onDelete,
}: NotificationListProps) {
  const t = useTranslations('notifications')
  const [isLoading, startTransition] = useTransition()

  const handleLoadMore = () => {
    if (!nextCursor) return
    startTransition(async () => {
      const result = await getNotificationsAction({
        cursor: nextCursor,
        limit: 20,
        filter: filter && filter !== 'all' ? filter : undefined,
        types: activeTypes,
      })
      if (result.success && result.data)
        onLoadMore(result.data.notifications, result.data.nextCursor)
    })
  }

  if (notifications.length === 0)
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Inbox className="text-muted-foreground mb-4 h-12 w-12" />
        <h3 className="text-lg font-medium">{t('inbox.empty')}</h3>
        <p className="text-muted-foreground mt-1 text-sm">{t('inbox.emptyDescription')}</p>
      </div>
    )

  return (
    <div className="space-y-2">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onDelete={onDelete}
        />
      ))}
      {nextCursor && (
        <div className="flex justify-center pt-4">
          <Button variant="outline" onClick={handleLoadMore} disabled={isLoading}>
            {t('inbox.loadMore')}
          </Button>
        </div>
      )}
    </div>
  )
}
