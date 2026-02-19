export const ORGANIZATION_STATUS_BADGE_VARIANTS = {
  ACTIVE: 'default',
  PENDING_PAYMENT: 'secondary',
  SUSPENDED: 'destructive',
  INACTIVE: 'outline',
} as const

export const ORGANIZATION_PLAN_BADGE_VARIANTS = {
  BASIC: 'outline',
  PRO: 'secondary',
  ENTERPRISE: 'default',
} as const

export const INVITATION_STATUS_BADGE_VARIANTS = {
  PENDING: 'secondary',
  ACCEPTED: 'default',
  REJECTED: 'destructive',
  EXPIRED: 'outline',
} as const
