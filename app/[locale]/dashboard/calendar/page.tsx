import { getTranslations } from 'next-intl/server'
import { Country } from '@prisma/client'

import { requireAdminHRWithOrg } from '@/src/shared/lib/auth'
import { getOrganizationCalendarAction } from '@/src/features/admin-hr/api'
import { OrganizationCalendarPage } from '@/src/features/admin-hr/ui'

interface CalendarPageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: CalendarPageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'adminHR.calendar' })

  return {
    title: t('title'),
    description: t('description'),
  }
}

export default async function CalendarPage({ params }: CalendarPageProps) {
  const { locale } = await params
  const session = await requireAdminHRWithOrg(locale)
  const t = await getTranslations('adminHR.calendar')

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  const result = await getOrganizationCalendarAction(currentYear, currentMonth)

  if (!result.success || !result.data)
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground mt-2">{t('description')}</p>
        </div>
        <p className="text-destructive">{result.error || t('errorLoading')}</p>
      </div>
    )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground mt-2">{t('description')}</p>
      </div>

      <OrganizationCalendarPage
        calendarDays={result.data}
        country={(session.country as Country) || Country.CL}
      />
    </div>
  )
}
