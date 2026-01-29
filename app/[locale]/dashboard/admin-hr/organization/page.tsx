import { getTranslations } from 'next-intl/server'

import { requireAdminHR } from '@/src/shared/lib/auth'
import { ROLES } from '@/src/shared/lib/constants'
import { getAdminHROrganization } from '@/src/features/admin-hr/data'
import { InvitationsTable } from '@/src/features/admin-hr/ui/invitations-table'
import { OrganizationLimitsCard } from '@/src/features/admin-hr/ui/organization-limits-card'
import { OrganizationTeamSection } from '@/src/features/admin-hr/ui/organization-team-section'
import { OrganizationView } from '@/src/features/admin-hr/ui/organization-view'

interface AdminHROrganizationPageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: AdminHROrganizationPageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'adminHR.organization' })

  return {
    title: `${t('title')} | VITA`,
    description: t('description'),
  }
}

export default async function AdminHROrganizationPage({ params }: AdminHROrganizationPageProps) {
  const { locale } = await params
  const user = await requireAdminHR(locale)
  const t = await getTranslations('adminHR.organization')
  const tInvitations = await getTranslations('adminHR.invitations')

  if (!user.organizationId)
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground mt-2">{t('noOrganization')}</p>
        </div>
      </div>
    )

  const organization = await getAdminHROrganization(user.organizationId)

  if (!organization)
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground mt-2">{t('organizationNotFound')}</p>
        </div>
      </div>
    )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground mt-2">{t('description')}</p>
      </div>

      <OrganizationView organization={organization} />

      <OrganizationLimitsCard
        organizationId={organization.id}
        maxAdminHR={organization.maxAdminHR}
        maxChiefs={organization.maxChiefs}
        maxStaff={organization.maxStaff}
      />

      <OrganizationTeamSection
        organizationId={organization.id}
        organizationCountry={organization.country}
        users={organization.chiefs}
        currentCount={organization.currentChiefs}
        maxLimit={organization.maxChiefs}
        translationNamespace="adminHR.organization.chiefs"
        allowedRoles={[{ value: ROLES.CHIEF_AREA, label: tInvitations('inviteForm.roleChief') }]}
        defaultRole={ROLES.CHIEF_AREA}
      />

      <OrganizationTeamSection
        organizationId={organization.id}
        organizationCountry={organization.country}
        users={organization.staff}
        currentCount={organization.currentStaff}
        maxLimit={organization.maxStaff}
        translationNamespace="adminHR.organization.staff"
        allowedRoles={[{ value: ROLES.STAFF_HEALTH, label: tInvitations('inviteForm.roleStaff') }]}
        defaultRole={ROLES.STAFF_HEALTH}
      />

      <InvitationsTable
        invitations={organization.invitations}
        translationNamespace="adminHR.invitations.table"
        showRoleColumn={true}
        roleLabels={{
          [ROLES.CHIEF_AREA]: tInvitations('table.roleChief'),
          [ROLES.STAFF_HEALTH]: tInvitations('table.roleStaff'),
        }}
      />
    </div>
  )
}
