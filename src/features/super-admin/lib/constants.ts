import { z } from 'zod'

export const OrganizationPlanEnum = z.enum(['BASIC', 'PRO', 'ENTERPRISE'])
export const OrganizationStatusEnum = z.enum(['ACTIVE', 'PENDING_PAYMENT', 'SUSPENDED', 'INACTIVE'])

export const PLAN_LIMITS = {
  BASIC: {
    maxAdminHR: 10,
    maxChiefs: 15,
    maxStaff: 100,
  },
  PRO: {
    maxAdminHR: 25,
    maxChiefs: 50,
    maxStaff: 300,
  },
  ENTERPRISE: {
    maxAdminHR: 50,
    maxChiefs: 100,
    maxStaff: 1000,
  },
} as const
