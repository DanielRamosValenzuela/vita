'use client'

import { useState, useTransition } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { enUS, es } from 'date-fns/locale'
import { Bell, Calendar, LayoutGrid, Mail, RefreshCw, Trash2, XCircle } from 'lucide-react'
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
} from '@/src/shared/ui/alert-dialog'
import { Button } from '@/src/shared/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/src/shared/ui/tooltip'
import {
  deleteNotificationAction,
  markNotificationReadAction,
} from '@/src/features/notifications/api'

import { useRouter } from '@/i18n/navigation'
import type { NotificationWithActor } from '@/src/entities/notification/lib/types'

const ICON_MAP = {
  Mail,
  LayoutGrid,
  Calendar,
  RefreshCw,
  XCircle,
  Bell,
} as const

const TYPE_ICON: Record<string, keyof typeof ICON_MAP> = {
  INVITATION_PENDING: 'Mail',
  AREA_ASSIGNED: 'LayoutGrid',
  SHIFT_CREATED: 'Calendar',
  SHIFT_UPDATED: 'RefreshCw',
  SHIFT_CANCELLED: 'XCircle',
  GENERAL: 'Bell',
}

const TYPE_COLOR: Record<string, string> = {
  INVITATION_PENDING: 'text-blue-500',
  AREA_ASSIGNED: 'text-green-500',
  SHIFT_CREATED: 'text-purple-500',
  SHIFT_UPDATED: 'text-orange-500',
  SHIFT_CANCELLED: 'text-red-500',
  GENERAL: 'text-muted-foreground',
}

interface NotificationItemProps {
  notification: NotificationWithActor
  onDelete?: (id: string) => void
}

export function NotificationItem({ notification, onDelete }: NotificationItemProps) {
  const t = useTranslations('notifications')
  const tCommon = useTranslations('common')
  const locale = useLocale()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const iconKey = TYPE_ICON[notification.type] ?? 'Bell'
  const Icon = ICON_MAP[iconKey]
  const colorClass = TYPE_COLOR[notification.type] ?? 'text-muted-foreground'

  const dateFnsLocale = locale === 'es' ? es : enUS
  const relativeDate = formatDistanceToNow(new Date(notification.createdAt), {
    addSuffix: true,
    locale: dateFnsLocale,
  })
  const absoluteDate = new Date(notification.createdAt).toLocaleString(
    locale === 'es' ? 'es-CL' : 'en-US'
  )

  const handleClick = () => {
    startTransition(async () => {
      if (!notification.isRead) await markNotificationReadAction(notification.id)
      router.push(notification.actionUrl as '/')
    })
  }

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteNotificationAction(notification.id)
      if (result.success) {
        toast.success(t('inbox.deleteSuccess'))
        onDelete?.(notification.id)
      }
    })
    setShowDeleteDialog(false)
  }

  return (
    <>
      <div
        className={`group relative flex items-start gap-3 rounded-lg border p-4 transition-colors ${
          notification.isRead ? 'bg-card hover:bg-accent/50' : 'bg-accent/30 hover:bg-accent/50'
        }`}
      >
        <button
          type="button"
          onClick={handleClick}
          disabled={isPending}
          className={`flex min-w-0 flex-1 items-start gap-3 text-left ${isPending ? 'opacity-60' : ''}`}
        >
          <div className={`mt-0.5 flex-shrink-0 ${colorClass}`}>
            <Icon className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-2">
              {!notification.isRead && (
                <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
              )}
              <div className="min-w-0 flex-1">
                <p className={`text-sm ${notification.isRead ? 'font-normal' : 'font-semibold'}`}>
                  {notification.title}
                </p>
                {notification.description && (
                  <p className="text-muted-foreground mt-0.5 text-xs">{notification.description}</p>
                )}
                {notification.organization && (
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    {notification.organization.name}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-1 flex items-center gap-2">
              {notification.actor && (
                <div className="flex items-center gap-1">
                  {notification.actor.customImage || notification.actor.image ? (
                    <Image
                      src={notification.actor.customImage || notification.actor.image || ''}
                      alt={notification.actor.name}
                      width={16}
                      height={16}
                      className="rounded-full"
                      unoptimized
                    />
                  ) : (
                    <span className="bg-primary text-primary-foreground flex h-4 w-4 items-center justify-center rounded-full text-[10px]">
                      {notification.actor.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              )}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-muted-foreground text-xs">{relativeDate}</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{absoluteDate}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-destructive h-8 w-8 flex-shrink-0 opacity-0 transition-opacity focus:opacity-100 group-hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation()
            setShowDeleteDialog(true)
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('inbox.deleteConfirm')}</AlertDialogTitle>
            <AlertDialogDescription>{notification.title}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>{tCommon('delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
