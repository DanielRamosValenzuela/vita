import { Country } from '@prisma/client'
import { z } from 'zod'

import { validateTaxId } from '@/src/shared/lib/utils/tax-id-config'
import type { ValidationMessages as AuthValidationMessages } from '@/src/features/auth/lib/schemas/auth-schema'

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

export function createUpdateProfileSchema(messages: ProfileValidationMessages) {
  return z.object({
    name: z.string().min(2, messages.name.minLength).max(100, messages.name.maxLength).trim(),
    email: z
      .string()
      .min(1, messages.email.required)
      .email(messages.email.invalid)
      .toLowerCase()
      .trim(),
  })
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
