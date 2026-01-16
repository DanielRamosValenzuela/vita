import { getTranslations } from 'next-intl/server'
import type { Role } from '@prisma/client'

import { requireAdminHR } from '@/src/shared/lib/auth'
import { getAdminHROrganization } from '@/src/features/admin-hr/data'
import { OrganizationView } from '@/src/features/admin-hr/ui/organization-view'
import { OrganizationTeamSection } from '@/src/features/admin-hr/ui/organization-team-section'
import { InvitationsTable } from '@/src/widgets/invitations'

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

  if (!user.organizationId) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground mt-2">{t('noOrganization')}</p>
        </div>
      </div>
    )
  }

  const organization = await getAdminHROrganization(user.organizationId)

  if (!organization) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground mt-2">{t('organizationNotFound')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground mt-2">{t('description')}</p>
      </div>

      <OrganizationView organization={organization} />

      <OrganizationTeamSection
        organizationId={organization.id}
        organizationCountry={organization.country}
        users={organization.chiefs}
        currentCount={organization.currentChiefs}
        maxLimit={organization.maxChiefs}
        translationNamespace="adminHR.organization.chiefs"
        allowedRoles={[
          { value: 'CHIEF_AREA' as Role, label: tInvitations('inviteForm.roleChief') },
        ]}
        defaultRole="CHIEF_AREA"
      />

      <OrganizationTeamSection
        organizationId={organization.id}
        organizationCountry={organization.country}
        users={organization.staff}
        currentCount={organization.currentStaff}
        maxLimit={organization.maxStaff}
        translationNamespace="adminHR.organization.staff"
        allowedRoles={[
          { value: 'STAFF_HEALTH' as Role, label: tInvitations('inviteForm.roleStaff') },
        ]}
        defaultRole="STAFF_HEALTH"
      />

      <InvitationsTable
        invitations={organization.invitations}
        translationNamespace="adminHR.invitations.table"
        actionContext="admin-hr"
        showRoleColumn={true}
        roleLabels={{
          CHIEF_AREA: tInvitations('table.roleChief'),
          STAFF_HEALTH: tInvitations('table.roleStaff'),
        }}
      />
    </div>
  )
}
