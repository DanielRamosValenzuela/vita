'use client'

import { useTranslations } from 'next-intl'
import { Calendar } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/shared/ui/card'

import type { CurrentUser } from '@/types'

interface CalendarViewProps {
  user: CurrentUser | null
}

export function CalendarView({ user }: CalendarViewProps) {
  const t = useTranslations('dashboard')

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calendar className="text-primary h-5 w-5" />
          <CardTitle>{t('calendarViewTitle')}</CardTitle>
        </div>
        <CardDescription>
          {user ? t('calendarViewAuthenticated') : t('calendarViewUnauthenticated')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex min-h-[400px] items-center justify-center rounded-lg border-2 border-dashed">
          <div className="text-center">
            <Calendar className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <p className="text-muted-foreground text-lg font-medium">{t('calendarViewComingSoon')}</p>
            <p className="text-muted-foreground mt-2 text-sm">
              {t('calendarViewComingSoonDescription')}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
