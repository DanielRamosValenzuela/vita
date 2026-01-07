import { z } from 'zod'
import { validateTaxId } from '@/src/shared/lib/utils/tax-id-config'
import type { Country } from '@prisma/client'

export const OrganizationPlanEnum = z.enum(['BASIC', 'PRO', 'ENTERPRISE'])
export const OrganizationStatusEnum = z.enum(['ACTIVE', 'PENDING_PAYMENT', 'SUSPENDED', 'INACTIVE'])
export const CountryEnum = z.enum(['CL', 'AR', 'PE', 'CO', 'MX'])

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

export const createOrganizationSchema = z
  .object({
    name: z
      .string()
      .min(3, 'El nombre debe tener al menos 3 caracteres')
      .max(100, 'El nombre no puede exceder 100 caracteres'),

    taxId: z.string().min(1, 'El identificador fiscal es obligatorio'),

    country: CountryEnum,

    plan: OrganizationPlanEnum,

    monthlyFee: z
      .number()
      .min(0, 'La tarifa mensual no puede ser negativa')
      .max(1000000, 'La tarifa mensual no puede exceder $1,000,000'),

    maxAdminHR: z
      .number()
      .int('Debe ser un número entero')
      .min(0, 'El límite no puede ser negativo')
      .max(50, 'El límite no puede exceder 50'),

    maxChiefs: z
      .number()
      .int('Debe ser un número entero')
      .min(0, 'El límite no puede ser negativo')
      .max(100, 'El límite no puede exceder 100'),

    maxStaff: z
      .number()
      .int('Debe ser un número entero')
      .min(0, 'El límite no puede ser negativo')
      .max(1000, 'El límite no puede exceder 1000'),

    contactName: z
      .string()
      .min(3, 'El nombre de contacto debe tener al menos 3 caracteres')
      .max(100, 'El nombre de contacto no puede exceder 100 caracteres'),

    contactEmail: z
      .string()
      .email('Debe ser un email válido')
      .max(100, 'El email no puede exceder 100 caracteres'),

    contactPhone: z
      .string()
      .min(8, 'El teléfono debe tener al menos 8 caracteres')
      .max(20, 'El teléfono no puede exceder 20 caracteres'),

    address: z
      .string()
      .max(200, 'La dirección no puede exceder 200 caracteres')
      .optional()
      .or(z.literal('')),
  })
  .refine(
    (data) => {
      return validateTaxId(data.taxId, data.country as Country)
    },
    {
      message: 'El identificador fiscal no es válido para el país seleccionado',
      path: ['taxId'],
    }
  )
  .refine(
    (data) => {
      const planLimits = PLAN_LIMITS[data.plan]
      return data.maxAdminHR <= planLimits.maxAdminHR
    },
    {
      message: 'El límite de Admin HR excede el máximo permitido para este plan',
      path: ['maxAdminHR'],
    }
  )
  .refine(
    (data) => {
      const planLimits = PLAN_LIMITS[data.plan]
      return data.maxChiefs <= planLimits.maxChiefs
    },
    {
      message: 'El límite de Jefes excede el máximo permitido para este plan',
      path: ['maxChiefs'],
    }
  )
  .refine(
    (data) => {
      const planLimits = PLAN_LIMITS[data.plan]
      return data.maxStaff <= planLimits.maxStaff
    },
    {
      message: 'El límite de Staff excede el máximo permitido para este plan',
      path: ['maxStaff'],
    }
  )

export const updateOrganizationSchema = z.object({
  id: z.string().cuid(),

  name: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .optional(),

  plan: OrganizationPlanEnum.optional(),

  monthlyFee: z
    .number()
    .min(0, 'La tarifa mensual no puede ser negativa')
    .max(1000000, 'La tarifa mensual no puede exceder $1,000,000')
    .optional(),

  maxAdminHR: z
    .number()
    .int('Debe ser un número entero')
    .min(0, 'El límite no puede ser negativo')
    .max(50, 'El límite no puede exceder 50')
    .optional(),

  maxChiefs: z
    .number()
    .int('Debe ser un número entero')
    .min(0, 'El límite no puede ser negativo')
    .max(100, 'El límite no puede exceder 100')
    .optional(),

  maxStaff: z
    .number()
    .int('Debe ser un número entero')
    .min(0, 'El límite no puede ser negativo')
    .max(1000, 'El límite no puede exceder 1000')
    .optional(),

  status: OrganizationStatusEnum.optional(),

  contactName: z
    .string()
    .min(3, 'El nombre de contacto debe tener al menos 3 caracteres')
    .max(100, 'El nombre de contacto no puede exceder 100 caracteres')
    .optional(),

  contactEmail: z
    .string()
    .email('Debe ser un email válido')
    .max(100, 'El email no puede exceder 100 caracteres')
    .optional(),

  contactPhone: z
    .string()
    .min(8, 'El teléfono debe tener al menos 8 caracteres')
    .max(20, 'El teléfono no puede exceder 20 caracteres')
    .optional()
    .or(z.literal('')),

  address: z
    .string()
    .max(200, 'La dirección no puede exceder 200 caracteres')
    .optional()
    .or(z.literal('')),
})

export const changeOrganizationStatusSchema = z.object({
  id: z.string().cuid(),
  status: OrganizationStatusEnum,
  reason: z
    .string()
    .min(10, 'La razón debe tener al menos 10 caracteres')
    .max(500, 'La razón no puede exceder 500 caracteres')
    .optional(),
})

export const deleteOrganizationSchema = z.object({
  id: z.string().cuid(),
  reason: z
    .string()
    .min(10, 'La razón debe tener al menos 10 caracteres')
    .max(500, 'La razón no puede exceder 500 caracteres'),
})

export const organizationFiltersSchema = z.object({
  search: z.string().optional(),
  status: OrganizationStatusEnum.optional(),
  plan: OrganizationPlanEnum.optional(),
  country: CountryEnum.optional(),
  page: z.number().min(1).default(1),
  pageSize: z.number().min(10).max(100).default(20),
})

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>
export type ChangeOrganizationStatusInput = z.infer<typeof changeOrganizationStatusSchema>
export type DeleteOrganizationInput = z.infer<typeof deleteOrganizationSchema>
export type OrganizationFilters = z.infer<typeof organizationFiltersSchema>
