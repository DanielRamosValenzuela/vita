'use client'

import {
  createAdminHRUserSchema,
  createUpdateAdminHRUserSchema,
} from '../../schemas/admin-hr-user-schema'
import { useAdminHRUserValidationMessages } from '../../validation/client/admin-hr-user-messages'

export function useCreateAdminHRUserSchema() {
  const messages = useAdminHRUserValidationMessages()
  return createAdminHRUserSchema(messages)
}

export function useUpdateAdminHRUserSchema() {
  const messages = useAdminHRUserValidationMessages()
  return createUpdateAdminHRUserSchema(messages)
}
