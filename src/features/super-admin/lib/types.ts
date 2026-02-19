import {
  Country,
  type Organization,
  type OrganizationPlan,
  type OrganizationStatus,
} from '@prisma/client'

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

export type CreateOrganizationInput = {
  name: string
  taxId: string
  country: Country
  plan: OrganizationPlan
  monthlyFee: number
  maxAdminHR: number
  maxChiefs: number
  maxStaff: number
  contactName: string
  contactEmail: string
  contactPhone: string
  address?: string
}

export type UpdateOrganizationInput = {
  id: string
  name?: string
  taxId?: string
  country?: Country
  plan?: OrganizationPlan
  monthlyFee?: number
  maxAdminHR?: number
  maxChiefs?: number
  maxStaff?: number
  status?: OrganizationStatus
  contactName?: string
  contactEmail?: string
  contactPhone?: string
  address?: string
}

export type ChangeOrganizationStatusInput = {
  id: string
  status: OrganizationStatus
  reason?: string
}

export type DeleteOrganizationInput = {
  id: string
  reason: string
}

export type UpdateAdminHRUserInput = {
  name?: string
  email?: string
  password?: string
  organizationId?: string
}
