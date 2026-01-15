import { z } from 'zod'

import { CountryEnum } from '@/src/shared/lib/constants'
import type { ValidationMessages as AuthValidationMessages } from '@/src/features/auth/lib/schemas/auth-schema'

export interface AdminHRUserValidationMessages {
  name: AuthValidationMessages['name']
  email: {
    invalid: string
  }
  password: AuthValidationMessages['password']
  organization: {
    required: string
  }
}

export function createAdminHRUserSchema(messages: AdminHRUserValidationMessages) {
  return z.object({
    name: z.string().min(2, messages.name.minLength).max(100, messages.name.maxLength),
    email: z.string().email(messages.email.invalid),
    password: z.string().min(8, messages.password.minLength).max(100, messages.password.maxLength),
    country: CountryEnum.optional(),
    docType: z
      .enum([
        'RUT',
        'CC',
        'CE',
        'TI',
        'DNI',
        'CARNET_EXT',
        'DNI_AR',
        'CUIL',
        'CUIT',
        'CURP',
        'RFC',
        'PASSPORT',
      ])
      .optional(),
    docNumber: z.string().optional(),
    organizationId: z.string().min(1, messages.organization.required),
  })
}

export function createUpdateAdminHRUserSchema(messages: AdminHRUserValidationMessages) {
  return z.object({
    name: z.string().min(2, messages.name.minLength).max(100, messages.name.maxLength).optional(),
    email: z.string().email(messages.email.invalid).optional(),
    password: z
      .string()
      .min(8, messages.password.minLength)
      .max(100, messages.password.maxLength)
      .optional(),
    organizationId: z.string().min(1, messages.organization.required).optional(),
  })
}
