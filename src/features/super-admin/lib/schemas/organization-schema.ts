import type { Country } from '@prisma/client'
import { z } from 'zod'

import { CountryEnum } from '@/src/shared/lib/constants'
import { validateTaxId } from '@/src/shared/lib/utils/tax-id-config'

import { OrganizationPlanEnum, OrganizationStatusEnum, PLAN_LIMITS } from '../constants'

export interface OrganizationValidationMessages {
  name: {
    minLength: (min: number) => string
    maxLength: (max: number) => string
  }
  contactName: {
    minLength: (min: number) => string
    maxLength: (max: number) => string
  }
  email: {
    required: string
    invalid: string
    maxLength: (max: number) => string
  }
  phone: {
    minLength: (min: number) => string
    maxLength: (max: number) => string
  }
  address: {
    maxLength: (max: number) => string
  }
  taxId: {
    required: string
    invalid: string
    minLength: (min: number) => string
    maxLength: (max: number) => string
  }
  monthlyFee: {
    min: string
    max: string
  }
  limit: {
    integer: string
    min: string
    max: (max: number) => string
  }
  planLimit: {
    maxAdminHRExceeded: string
    maxChiefsExceeded: string
    maxStaffExceeded: string
  }
  reason: {
    minLength: (min: number) => string
    maxLength: (max: number) => string
  }
}

export function createOrganizationSchema(messages: OrganizationValidationMessages) {
  return z
    .object({
      name: z.string().min(3, messages.name.minLength(3)).max(100, messages.name.maxLength(100)),
      taxId: z.string().min(1, messages.taxId.required),
      country: CountryEnum,
      plan: OrganizationPlanEnum,
      monthlyFee: z.number().min(0, messages.monthlyFee.min).max(1000000, messages.monthlyFee.max),
      maxAdminHR: z
        .number()
        .int(messages.limit.integer)
        .min(0, messages.limit.min)
        .max(50, messages.limit.max(50)),
      maxChiefs: z
        .number()
        .int(messages.limit.integer)
        .min(0, messages.limit.min)
        .max(100, messages.limit.max(100)),
      maxStaff: z
        .number()
        .int(messages.limit.integer)
        .min(0, messages.limit.min)
        .max(1000, messages.limit.max(1000)),
      contactName: z
        .string()
        .min(3, messages.contactName.minLength(3))
        .max(100, messages.contactName.maxLength(100)),
      contactEmail: z
        .string()
        .email(messages.email.invalid)
        .max(100, messages.email.maxLength(100)),
      contactPhone: z
        .string()
        .min(8, messages.phone.minLength(8))
        .max(20, messages.phone.maxLength(20)),
      address: z.string().max(200, messages.address.maxLength(200)).optional().or(z.literal('')),
    })
    .refine(
      (data) => {
        return validateTaxId(data.taxId, data.country as Country)
      },
      {
        message: messages.taxId.invalid,
        path: ['taxId'],
      }
    )
    .refine(
      (data) => {
        const planLimits = PLAN_LIMITS[data.plan]
        return data.maxAdminHR <= planLimits.maxAdminHR
      },
      {
        message: messages.planLimit.maxAdminHRExceeded,
        path: ['maxAdminHR'],
      }
    )
    .refine(
      (data) => {
        const planLimits = PLAN_LIMITS[data.plan]
        return data.maxChiefs <= planLimits.maxChiefs
      },
      {
        message: messages.planLimit.maxChiefsExceeded,
        path: ['maxChiefs'],
      }
    )
    .refine(
      (data) => {
        const planLimits = PLAN_LIMITS[data.plan]
        return data.maxStaff <= planLimits.maxStaff
      },
      {
        message: messages.planLimit.maxStaffExceeded,
        path: ['maxStaff'],
      }
    )
}

export function createUpdateOrganizationSchema(messages: OrganizationValidationMessages) {
  return z
    .object({
      id: z.string().cuid(),
      name: z
        .string()
        .min(3, messages.name.minLength(3))
        .max(100, messages.name.maxLength(100))
        .optional(),
      taxId: z
        .string()
        .min(5, messages.taxId.minLength(5))
        .max(20, messages.taxId.maxLength(20))
        .optional(),
      country: CountryEnum.optional(),
      plan: OrganizationPlanEnum.optional(),
      monthlyFee: z
        .number()
        .min(0, messages.monthlyFee.min)
        .max(1000000, messages.monthlyFee.max)
        .optional(),
      maxAdminHR: z
        .number()
        .int(messages.limit.integer)
        .min(0, messages.limit.min)
        .max(50, messages.limit.max(50))
        .optional(),
      maxChiefs: z
        .number()
        .int(messages.limit.integer)
        .min(0, messages.limit.min)
        .max(100, messages.limit.max(100))
        .optional(),
      maxStaff: z
        .number()
        .int(messages.limit.integer)
        .min(0, messages.limit.min)
        .max(1000, messages.limit.max(1000))
        .optional(),
      status: OrganizationStatusEnum.optional(),
      contactName: z
        .string()
        .min(3, messages.contactName.minLength(3))
        .max(100, messages.contactName.maxLength(100))
        .optional(),
      contactEmail: z
        .string()
        .email(messages.email.invalid)
        .max(100, messages.email.maxLength(100))
        .optional(),
      contactPhone: z
        .string()
        .min(8, messages.phone.minLength(8))
        .max(20, messages.phone.maxLength(20))
        .optional()
        .or(z.literal('')),
      address: z.string().max(200, messages.address.maxLength(200)).optional().or(z.literal('')),
    })
    .refine(
      (data) => {
        if (!data.taxId || !data.country) return true
        return validateTaxId(data.taxId, data.country as Country)
      },
      {
        message: messages.taxId.invalid,
        path: ['taxId'],
      }
    )
    .refine(
      (data) => {
        if (!data.plan || !data.maxAdminHR) return true
        const planLimits = PLAN_LIMITS[data.plan]
        return data.maxAdminHR <= planLimits.maxAdminHR
      },
      {
        message: messages.planLimit.maxAdminHRExceeded,
        path: ['maxAdminHR'],
      }
    )
    .refine(
      (data) => {
        if (!data.plan || !data.maxChiefs) return true
        const planLimits = PLAN_LIMITS[data.plan]
        return data.maxChiefs <= planLimits.maxChiefs
      },
      {
        message: messages.planLimit.maxChiefsExceeded,
        path: ['maxChiefs'],
      }
    )
    .refine(
      (data) => {
        if (!data.plan || !data.maxStaff) return true
        const planLimits = PLAN_LIMITS[data.plan]
        return data.maxStaff <= planLimits.maxStaff
      },
      {
        message: messages.planLimit.maxStaffExceeded,
        path: ['maxStaff'],
      }
    )
}

export function createChangeOrganizationStatusSchema(messages: OrganizationValidationMessages) {
  return z.object({
    id: z.string().cuid(),
    status: OrganizationStatusEnum,
    reason: z
      .string()
      .min(10, messages.reason.minLength(10))
      .max(500, messages.reason.maxLength(500))
      .optional(),
  })
}

export function createDeleteOrganizationSchema(messages: OrganizationValidationMessages) {
  return z.object({
    id: z.string().cuid(),
    reason: z
      .string()
      .min(10, messages.reason.minLength(10))
      .max(500, messages.reason.maxLength(500)),
  })
}

