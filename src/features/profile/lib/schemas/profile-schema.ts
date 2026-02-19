import { Country } from '@prisma/client'
import { z } from 'zod'

import type { AuthValidationMessages } from '@/src/shared/lib/types'
import { validateTaxId } from '@/src/shared/lib/utils/tax-id-config'

export interface ProfileValidationMessages {
  name: AuthValidationMessages['name']
  email: AuthValidationMessages['email']
  password: AuthValidationMessages['password']
  confirmPassword: AuthValidationMessages['confirmPassword']
  currentPassword: {
    required: string
  }
  description: {
    maxLength: (max: number) => string
  }
  document: {
    required: string
    invalid: string
  }
}

export function createChangePasswordSchema(messages: ProfileValidationMessages) {
  return z
    .object({
      currentPassword: z.string().min(1, messages.currentPassword.required),
      newPassword: z
        .string()
        .min(8, messages.password.minLength)
        .max(100, messages.password.maxLength)
        .regex(/[A-Z]/, messages.password.uppercase)
        .regex(/[a-z]/, messages.password.lowercase)
        .regex(/[0-9]/, messages.password.number),
      confirmPassword: z.string().min(1, messages.confirmPassword.required),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: messages.confirmPassword.mismatch,
      path: ['confirmPassword'],
    })
}

export function createUpdateDocumentSchema(country: Country, messages: ProfileValidationMessages) {
  return z.object({
    country: z.nativeEnum(Country),
    docNumber: z
      .string()
      .min(1, messages.document.required)
      .refine((val) => validateTaxId(val, country), {
        message: messages.document.invalid,
      }),
  })
}
