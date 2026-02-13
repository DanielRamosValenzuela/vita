'use client'

import { useEffect } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { NOTIFICATIONS_LIMITS } from '@/src/shared/lib/constants'

import { NOTIFICATION_TYPES, type PendingNotification } from '@/src/entities/notification/lib/types'

const STORAGE_KEY = 'vita:pending-notifications:shown-ids'

interface PendingNotificationsToasterProps {
  notifications: PendingNotification[]
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
      let message: string | null = null
      let href: string | undefined

      switch (notification.type) {
        case NOTIFICATION_TYPES.INVITATION_PENDING: {
          const organizationName = notification.meta?.organizationName as string | undefined
          href = `/${locale}/dashboard/profile?section=invitations`
          message = t('invitationPending', {
            organization: organizationName ?? '',
          })
          break
        }
        default:
          break
      }

      if (!message) return

      toast.info(message, {
        action: href
          ? {
              label: t('actions.view'),
              onClick: () => {
                window.location.href = href as string
              },
            }
          : undefined,
      })
    })

    const updatedShownIds = Array.from(new Set([...shownIds, ...unseen.map((n) => n.id)]))

    if (typeof window !== 'undefined')
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updatedShownIds))
  }, [locale, notifications, t])

  return null
}
