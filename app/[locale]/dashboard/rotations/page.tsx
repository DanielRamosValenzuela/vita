import { getTranslations } from 'next-intl/server'

import { resolveChiefOrganizationId } from '@/src/shared/lib/auth/chief-access'
import { isChiefArea } from '@/src/shared/lib/auth/rbac'
import { requireAdminHROrChief } from '@/src/shared/lib/auth/session'
import { getAreasAction } from '@/src/features/area/api'
import { getRotationsAction } from '@/src/features/rotations/api'
import { RotationsPageContent } from '@/src/features/rotations/ui'

interface RotationsPageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: RotationsPageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'rotations' })

  return {
    title: `${t('title')} | VITA`,
    description: t('description'),
  }
}

export default async function RotationsPage({ params }: RotationsPageProps) {
  const { locale } = await params
  const [session, t] = await Promise.all([
    requireAdminHROrChief(locale),
    getTranslations('rotations'),
  ])

  const organizationId = isChiefArea(session)
    ? await resolveChiefOrganizationId(session.id, session.organizationId ?? null)
    : session.organizationId ?? null

  if (!organizationId)
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground mt-2">{t('noOrganization')}</p>
        </div>
      </div>
    )

  const [rotationsResult, areasResult] = await Promise.all([
    getRotationsAction({}),
    getAreasAction(),
  ])

  if (!rotationsResult.success || !areasResult.success)
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground mt-2">{t('loadError')}</p>
        </div>
      </div>
    )

  const areasRaw = Array.isArray(areasResult.data) ? areasResult.data : []
  const areas = areasRaw
    .filter((area: { id: string; name: string; isActive?: boolean }) => area.isActive !== false)
    .map((area: { id: string; name: string }) => ({
      id: area.id,
      name: area.name,
    }))

  return (
    <RotationsPageContent
      initialRotations={rotationsResult.data?.rotations || []}
      initialTotal={rotationsResult.data?.total || 0}
      areas={areas}
    />
  )
}
