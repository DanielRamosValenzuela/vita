'use client'

import { useTranslations } from 'next-intl'
import { CheckCircle2, Link as LinkIcon, Star, Trash2, Unlink } from 'lucide-react'

import { Badge } from '@/src/shared/ui/badge'
import { Button } from '@/src/shared/ui/button'
import { GoogleIcon } from '@/src/shared/ui/icons'

export interface UserEmail {
  id: string
  email: string
  isPrimary: boolean
  isVerified: boolean
  provider: string | null
  createdAt: Date
}

interface EmailListItemProps {
  email: UserEmail
  isPending: boolean
  onLinkGoogle: (emailId: string) => void
  onUnlinkGoogle: (emailId: string) => void
  onSetPrimary: (emailId: string) => void
  onDelete: (emailId: string) => void
}

export function EmailListItem({
  email,
  isPending,
  onLinkGoogle,
  onUnlinkGoogle,
  onSetPrimary,
  onDelete,
}: EmailListItemProps) {
  const t = useTranslations('profile.emails')

  const isGmail = email.email.endsWith('@gmail.com')
  const isLinkedWithGoogle = email.provider === 'GOOGLE'

  return (
    <div className="border-border flex items-center justify-between rounded-lg border p-4">
      <div className="flex items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium">{email.email}</p>
            {email.isPrimary && (
              <Badge variant="default" className="text-xs">
                {t('primary')}
              </Badge>
            )}
            {email.isVerified && <CheckCircle2 className="text-green-600 h-4 w-4" />}
            {email.provider && (
              <Badge variant="outline" className="text-xs">
                {email.provider}
              </Badge>
            )}
          </div>
          {!email.isVerified && (
            <p className="text-muted-foreground text-xs">{t('notVerified')}</p>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        {isGmail && !isLinkedWithGoogle && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onLinkGoogle(email.id)}
            disabled={isPending}
            title={t('linkWithGoogle')}
            className="gap-2"
          >
            <GoogleIcon className="h-4 w-4" />
            <LinkIcon className="h-3 w-3" />
          </Button>
        )}

        {isLinkedWithGoogle && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onUnlinkGoogle(email.id)}
            disabled={isPending}
            title={t('unlinkGoogle')}
            className="gap-2"
          >
            <GoogleIcon className="h-4 w-4" />
            <Unlink className="h-3 w-3" />
          </Button>
        )}

        {!email.isPrimary && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSetPrimary(email.id)}
            disabled={isPending}
            title={t('setPrimary')}
          >
            <Star className="h-4 w-4" />
          </Button>
        )}

        {!email.isPrimary && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(email.id)}
            disabled={isPending}
            title={t('removeEmail')}
          >
            <Trash2 className="text-destructive h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
