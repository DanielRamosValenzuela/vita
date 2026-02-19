'use client'

import { useEffect } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import type { NotificationType } from '@prisma/client'
import { toast } from 'sonner'

import { NOTIFICATIONS_LIMITS } from '@/src/shared/lib/constants'

import type { NotificationWithActor } from '@/src/entities/notification/lib/types'

const STORAGE_KEY = 'vita:pending-notifications:shown-ids'

const TOAST_METHOD: Record<NotificationType, 'info' | 'success' | 'warning'> = {
  INVITATION_PENDING: 'info',
  AREA_ASSIGNED: 'info',
  SHIFT_CREATED: 'success',
  SHIFT_UPDATED: 'info',
  SHIFT_CANCELLED: 'warning',
  GENERAL: 'info',
}

interface PendingNotificationsToasterProps {
  notifications: NotificationWithActor[]
}

export function PendingNotificationsToaster({ notifications }: PendingNotificationsToasterProps) {
  const t = useTranslations('notifications')
  const locale = useLocale()

  useEffect(() => {
    if (!notifications?.length) return

    let shownIds: string[] = []

    if (typeof window !== 'undefined')
      try {
        const raw = window.sessionStorage.getItem(STORAGE_KEY)
        shownIds = raw ? (JSON.parse(raw) as string[]) : []
      } catch {
        shownIds = []
      }

    const unseen = notifications
      .filter((n) => !shownIds.includes(n.id))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, NOTIFICATIONS_LIMITS.TOASTS_PER_LOAD)

    if (!unseen.length) return

    unseen.forEach((notification) => {
      const href = `/${locale}${notification.actionUrl}`
      const method = TOAST_METHOD[notification.type] ?? 'info'

      toast[method](notification.title, {
        description: notification.description ?? undefined,
        action: {
          label: t('actions.view'),
          onClick: () => {
            window.location.href = href
          },
        },
      })
    })

    const updatedShownIds = Array.from(new Set([...shownIds, ...unseen.map((n) => n.id)]))

    if (typeof window !== 'undefined')
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updatedShownIds))
  }, [locale, notifications, t])

  return null
}
