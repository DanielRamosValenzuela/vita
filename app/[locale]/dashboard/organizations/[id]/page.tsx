import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import type { Role } from '@prisma/client'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ArrowLeft, Calendar, DollarSign, Edit, Users } from 'lucide-react'

import { requireSuperAdmin } from '@/src/shared/lib/auth/session'
import { formatCurrency } from '@/src/shared/lib/utils/format'
import { Badge } from '@/src/shared/ui/badge'
import { Button } from '@/src/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/shared/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/shared/ui/table'
import { getOrganizationById } from '@/src/features/super-admin/data/organization-repository'
import { InvitationsTable } from '@/src/widgets/invitations'
import { OrganizationAdminHRSection } from '@/src/features/super-admin/ui/organization-admin-hr-section'

import { Link } from '@/i18n/navigation'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

interface OrganizationUser {
  id: string
  name: string
  email: string
  role: Role
  createdAt: Date
}

const OrganizationDetailsPage = async ({ params }: PageProps) => {
  await requireSuperAdmin()

  const { id } = await params
  const organization = await getOrganizationById(id)

  if (!organization) {
    notFound()
  }

  const t = await getTranslations('superAdmin.organizationDetails')
  const tOrg = await getTranslations('superAdmin.organizations')

  type OrganizationWithCount = typeof organization & {
    _count: {
      users: number
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      ACTIVE: 'default',
      PENDING_PAYMENT: 'secondary',
      SUSPENDED: 'destructive',
      INACTIVE: 'outline',
    }

    const statusKey = `statuses.${status}` as
      | 'statuses.ACTIVE'
      | 'statuses.PENDING_PAYMENT'
      | 'statuses.SUSPENDED'
      | 'statuses.INACTIVE'

    return <Badge variant={variants[status] || 'outline'}>{tOrg(statusKey)}</Badge>
  }

  const getPlanBadge = (plan: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
      BASIC: 'outline',
      PRO: 'secondary',
      ENTERPRISE: 'default',
    }

    const planKey = `plans.${plan}` as 'plans.BASIC' | 'plans.PRO' | 'plans.ENTERPRISE'

    return <Badge variant={variants[plan] || 'outline'}>{tOrg(planKey)}</Badge>
  }

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      SUPER_ADMIN: 'Super Administrador',
      ADMIN_HR: 'Administrador RRHH',
      CHIEF_AREA: 'Jefe de Área',
      STAFF_HEALTH: 'Personal de Salud',
    }
    return labels[role] || role
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/organizations">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{organization.name}</h1>
            <p className="text-muted-foreground">
              {tOrg('table.taxId')}: {organization.taxId}
            </p>
          </div>
        </div>
        <Link href={`/dashboard/organizations/${organization.id}/edit`}>
          <Button className="gap-2">
            <Edit className="h-4 w-4" />
            {t('actions.edit')}
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{tOrg('table.status')}</CardTitle>
          </CardHeader>
          <CardContent>{getStatusBadge(organization.status)}</CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{tOrg('table.plan')}</CardTitle>
          </CardHeader>
          <CardContent>{getPlanBadge(organization.plan)}</CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{tOrg('table.monthlyFee')}</CardTitle>
            <DollarSign className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(organization.monthlyFee)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{tOrg('table.nextPayment')}</CardTitle>
            <Calendar className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {organization.nextPayment
                ? format(new Date(organization.nextPayment), 'dd MMM', { locale: es })
                : '-'}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-1">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('overview.totalUsers')}</CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(organization as OrganizationWithCount)._count.users}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{tOrg('table.contact')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid gap-2 md:grid-cols-2">
            <div>
              <p className="text-muted-foreground text-sm font-medium">{t('users.columns.name')}</p>
              <p>{organization.contactName || '-'}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm font-medium">
                {t('users.columns.email')}
              </p>
              <p>{organization.contactEmail || '-'}</p>
            </div>
            {organization.contactPhone && (
              <div>
                <p className="text-muted-foreground text-sm font-medium">{t('contact.phone')}</p>
                <p>{organization.contactPhone}</p>
              </div>
            )}
            {organization.address && (
              <div className="md:col-span-2">
                <p className="text-muted-foreground text-sm font-medium">{t('contact.address')}</p>
                <p>{organization.address}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <OrganizationAdminHRSection
        organization={organization}
        adminHRUsers={organization.users.filter((u) => u.role === 'ADMIN_HR')}
        currentCount={organization.users.filter((u) => u.role === 'ADMIN_HR').length}
        maxLimit={organization.maxAdminHR}
      />

      <InvitationsTable
        invitations={organization.invitations || []}
        translationNamespace="superAdmin.organizationDetails.invitations"
        actionContext="super-admin"
        showRoleColumn={false}
      />

      <Card>
        <CardHeader>
          <CardTitle>{t('users.title')}</CardTitle>
          <CardDescription>
            {organization.users.length} {t('users.noUsers')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {organization.users.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">{t('users.noUsers')}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('users.columns.name')}</TableHead>
                  <TableHead>{t('users.columns.email')}</TableHead>
                  <TableHead>{t('users.columns.role')}</TableHead>
                  <TableHead>{t('users.columns.joinedAt')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {organization.users.map((user: OrganizationUser) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{getRoleLabel(user.role)}</Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(user.createdAt), 'dd MMM yyyy', { locale: es })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('overview.info')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid gap-2 md:grid-cols-2">
            <div>
              <p className="text-muted-foreground text-sm font-medium">{tOrg('filters.country')}</p>
              <p>
                {tOrg(
                  `countries.${organization.country}` as
                    | 'countries.CL'
                    | 'countries.AR'
                    | 'countries.PE'
                    | 'countries.CO'
                    | 'countries.MX'
                )}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm font-medium">{t('overview.createdAt')}</p>
              <p>{format(new Date(organization.createdAt), 'dd MMMM yyyy', { locale: es })}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm font-medium">{t('overview.updatedAt')}</p>
              <p>{format(new Date(organization.updatedAt), 'dd MMMM yyyy', { locale: es })}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default OrganizationDetailsPage
