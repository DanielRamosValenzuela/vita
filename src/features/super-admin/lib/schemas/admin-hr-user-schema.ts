import { z } from 'zod'

import type { AuthValidationMessages } from '@/src/shared/lib/types'

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
