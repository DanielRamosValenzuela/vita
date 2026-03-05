import { getTranslations } from 'next-intl/server'

import { requireAdminHROrChief } from '@/src/shared/lib/auth'
import { isChiefArea } from '@/src/shared/lib/auth/rbac'
import { prisma } from '@/src/shared/lib/db'
import { getAreasAction } from '@/src/features/area/api'
import { AreasTable } from '@/src/features/area/ui'

interface AreasPageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: AreasPageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'adminHR.areas' })

  return {
    title: `${t('title')} | VITA`,
    description: t('description'),
  }
}

export default async function AreasPage({ params }: AreasPageProps) {
  const { locale } = await params
  const [user, t] = await Promise.all([
    requireAdminHROrChief(locale),
    getTranslations('adminHR.areas'),
  ])

  let organizationId: string | null = user.organizationId ?? null
  if (isChiefArea(user) && !organizationId) {
    const firstArea = await prisma.userArea.findFirst({
      where: { userId: user.id },
      select: { area: { select: { organizationId: true } } },
    })
    organizationId = firstArea?.area?.organizationId ?? null
    if (!organizationId) {
      const firstSector = await prisma.userSector.findFirst({
        where: { userId: user.id },
        select: { sector: { select: { organizationId: true } } },
      })
      organizationId = firstSector?.sector?.organizationId ?? null
    }
  }

  if (!organizationId)
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground mt-1">{t('description')}</p>
        </div>
        <div className="bg-destructive/10 text-destructive border-destructive/20 rounded-lg border p-4">
          {t('noOrganization')}
        </div>
      </div>
    )

  const result = await getAreasAction()
  const areas = (result.success && result.data ? result.data : []) as Array<{
    id: string
    name: string
    description: string | null
    icon: string | null
    color: string
    isActive: boolean
    _count?: { shiftTypes: number; userAreas?: number; contracts?: number }
  }>

  return (
    <AreasTable areas={areas} canCreate={!isChiefArea(user)} canDelete={!isChiefArea(user)} />
  )
}
