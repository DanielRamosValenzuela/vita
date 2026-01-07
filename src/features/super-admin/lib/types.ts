import type { Organization, OrganizationStatus, OrganizationPlan, Country } from '@prisma/client'

export interface OrganizationWithCount extends Organization {
  _count: {
    users: number
  }
  users: Array<{
    role: string
  }>
}

export interface OrganizationsTableProps {
  initialOrganizations: OrganizationWithCount[]
  initialTotal: number
  initialPage: number
  initialTotalPages: number
  initialFilters: {
    search: string
    status: OrganizationStatus | 'ALL'
    plan: OrganizationPlan | 'ALL'
    country: Country | 'ALL'
  }
}

export interface OrganizationSummary {
  id: string
  name: string
  status: OrganizationStatus
  plan: OrganizationPlan
  userCount: number
  maxUsers: number
}

export interface OrganizationActionResult {
  success: boolean
  error?: string
  data?: Organization
}
