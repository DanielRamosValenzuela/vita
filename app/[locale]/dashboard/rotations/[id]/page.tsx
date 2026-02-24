import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

import { isChiefArea } from '@/src/shared/lib/auth/rbac'
import { requireAdminHROrChiefArea } from '@/src/shared/lib/auth/session'
import { prisma } from '@/src/shared/lib/db'
import { getRotationAction } from '@/src/features/rotations/api'
import { RotationDetailContent } from '@/src/features/rotations/ui'

interface RotationDetailPageProps {
  params: Promise<{ locale: string; id: string }>
}

export async function generateMetadata({ params }: RotationDetailPageProps) {
  const { locale, id } = await params
  const t = await getTranslations({ locale, namespace: 'rotations' })
  const result = await getRotationAction(id)

  if (!result.success || !result.data)
    return { title: `${t('detail.pageTitle')} | VITA` }

  return {
    title: `${result.data.name} | VITA`,
    description: t('description'),
  }
}

export default async function RotationDetailPage({ params }: RotationDetailPageProps) {
  const { locale, id } = await params
  const [session] = await Promise.all([
    requireAdminHROrChiefArea(locale),
  ])

  let organizationId: string | null = session.organizationId ?? null
  if (isChiefArea(session) && !organizationId) {
    const firstArea = await prisma.userArea.findFirst({
      where: { userId: session.id },
      select: { area: { select: { organizationId: true } } },
    })
    organizationId = firstArea?.area?.organizationId ?? null
  }

  if (!organizationId) notFound()

  const result = await getRotationAction(id)

  if (!result.success || !result.data) notFound()

  return <RotationDetailContent initialRotation={result.data} />
}
