import { Suspense } from 'react'
import { getTranslations } from 'next-intl/server'
import type { Country, OrganizationPlan, OrganizationStatus } from '@prisma/client'
import { Plus } from 'lucide-react'

import { requireSuperAdmin } from '@/src/shared/lib/auth/session'
import { Button } from '@/src/shared/ui/button'
import { getOrganizations } from '@/src/features/super-admin/data'
import { OrganizationsTableClient } from '@/src/features/super-admin/ui'

import { Link } from '@/i18n/navigation'

interface PageProps {
  searchParams: Promise<{
    search?: string
    status?: string
    plan?: string
    country?: string
    page?: string
  }>
}

const OrganizationsPage = async ({ searchParams }: PageProps) => {
  await requireSuperAdmin()
  const [t, tCommon, params] = await Promise.all([
    getTranslations('superAdmin.organizations'),
    getTranslations('common'),
    searchParams,
  ])
  const search = params.search || ''
  const status =
    params.status && params.status !== 'ALL' ? (params.status as OrganizationStatus) : undefined
  const plan = params.plan && params.plan !== 'ALL' ? (params.plan as OrganizationPlan) : undefined
  const country =
    params.country && params.country !== 'ALL' ? (params.country as Country) : undefined
  const page = params.page ? parseInt(params.page) : 1

  const { organizations, total, totalPages } = await getOrganizations({
    search,
    status,
    plan,
    country,
    page,
    pageSize: 20,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
        <Link href="/dashboard/organizations/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            {t('newOrganization')}
          </Button>
        </Link>
      </div>

      <Suspense fallback={<div>{tCommon('loading')}</div>}>
        <OrganizationsTableClient
          initialOrganizations={organizations}
          initialTotal={total}
          initialPage={page}
          initialTotalPages={totalPages}
          initialFilters={{
            search,
            status: status || 'ALL',
            plan: plan || 'ALL',
            country: country || 'ALL',
          }}
        />
      </Suspense>
    </div>
  )
}

export default OrganizationsPage
