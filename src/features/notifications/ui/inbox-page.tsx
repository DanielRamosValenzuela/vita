'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import type { NotificationType } from '@prisma/client'
import { CheckCheck } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/src/shared/ui/button'
import {
  getNotificationsAction,
  markAllNotificationsReadAction,
} from '@/src/features/notifications/api'

import type { NotificationWithActor } from '@/src/entities/notification/lib/types'

import { InboxFilters, TYPE_GROUPS } from './inbox-filters'
import { NotificationList } from './notification-list'

interface InboxPageProps {
  initialNotifications: NotificationWithActor[]
  nextCursor: string | null
  unreadCount: number
}

function resolveTypes(selectedKeys: string[]): NotificationType[] | undefined {
  if (selectedKeys.length === 0) return undefined
  const types: NotificationType[] = []
  for (const key of selectedKeys) {
    const group = TYPE_GROUPS.find((g) => g.key === key)
    if (group) types.push(...group.types)
  }
  return types.length > 0 ? types : undefined
}

export function InboxPage({ initialNotifications, nextCursor, unreadCount }: InboxPageProps) {
  const t = useTranslations('notifications')
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [statusFilter, setStatusFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [selectedTypeKeys, setSelectedTypeKeys] = useState<string[]>([])
  const [filteredNotifications, setFilteredNotifications] =
    useState<NotificationWithActor[]>(initialNotifications)
  const [filteredCursor, setFilteredCursor] = useState<string | null>(nextCursor)
  const [isFiltering, startFilterTransition] = useTransition()

  const handleMarkAllRead = () => {
    startTransition(async () => {
      const result = await markAllNotificationsReadAction()
      if (result.success && result.data) {
        toast.success(t('inbox.markAllReadSuccess', { count: result.data.count }))
        router.refresh()
      }
    })
  }

  const applyFilters = (newStatus: 'all' | 'unread' | 'read', newTypeKeys: string[]) => {
    startFilterTransition(async () => {
      const result = await getNotificationsAction({
        limit: 20,
        filter: newStatus !== 'all' ? newStatus : undefined,
        types: resolveTypes(newTypeKeys),
      })
      if (result.success && result.data) {
        setFilteredNotifications(result.data.notifications)
        setFilteredCursor(result.data.nextCursor)
      }
    })
  }

  const handleStatusChange = (filter: 'all' | 'unread' | 'read') => {
    setStatusFilter(filter)
    applyFilters(filter, selectedTypeKeys)
  }

  const handleTypeKeysChange = (keys: string[]) => {
    setSelectedTypeKeys(keys)
    applyFilters(statusFilter, keys)
  }

  const activeTypes = resolveTypes(selectedTypeKeys)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('inbox.title')}</h1>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead} disabled={isPending}>
            <CheckCheck className="mr-2 h-4 w-4" />
            {t('inbox.markAllRead')}
          </Button>
        )}
      </div>

      <InboxFilters
        statusFilter={statusFilter}
        selectedTypeKeys={selectedTypeKeys}
        onStatusChange={handleStatusChange}
        onTypeKeysChange={handleTypeKeysChange}
      />

      <div className={isFiltering ? 'pointer-events-none opacity-50' : ''}>
        <NotificationList
          notifications={filteredNotifications}
          nextCursor={filteredCursor}
          filter={statusFilter}
          activeTypes={activeTypes}
          onLoadMore={(newNotifications, newCursor) => {
            setFilteredNotifications((prev) => [...prev, ...newNotifications])
            setFilteredCursor(newCursor)
          }}
          onDelete={(id) => {
            setFilteredNotifications((prev) => prev.filter((n) => n.id !== id))
          }}
        />
      </div>
    </div>
  )
}
