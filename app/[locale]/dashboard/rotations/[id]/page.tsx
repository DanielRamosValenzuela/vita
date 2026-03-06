import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'

import { resolveChiefOrganizationId } from '@/src/shared/lib/auth/chief-access'
import { isChiefArea } from '@/src/shared/lib/auth/rbac'
import { requireAdminHROrChief } from '@/src/shared/lib/auth/session'
import { getRotationAction } from '@/src/features/rotations/api'
import { RotationDetailContent } from '@/src/features/rotations/ui'

interface RotationDetailPageProps {
  params: Promise<{ locale: string; id: string }>
}

export async function generateMetadata({ params }: RotationDetailPageProps) {
  const { locale, id } = await params
  const [t, result] = await Promise.all([
    getTranslations({ locale, namespace: 'rotations' }),
    getRotationAction(id),
  ])

  if (!result.success || !result.data) return { title: `${t('detail.pageTitle')} | VITA` }

  return {
    title: `${result.data.name} | VITA`,
    description: t('description'),
  }
}

export default async function RotationDetailPage({ params }: RotationDetailPageProps) {
  const { locale, id } = await params
  const [session] = await Promise.all([requireAdminHROrChief(locale)])

  const organizationId = isChiefArea(session)
    ? await resolveChiefOrganizationId(session.id, session.organizationId ?? null)
    : (session.organizationId ?? null)

  if (!organizationId) notFound()

  const result = await getRotationAction(id)

  if (!result.success || !result.data) notFound()

  return <RotationDetailContent initialRotation={result.data} />
}
