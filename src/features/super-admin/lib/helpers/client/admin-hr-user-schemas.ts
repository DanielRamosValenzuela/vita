'use client'

import { createUpdateAdminHRUserSchema } from '../../schemas/admin-hr-user-schema'
import { useAdminHRUserValidationMessages } from '../../validation/client/admin-hr-user-messages'

export function useUpdateAdminHRUserSchema() {
  const messages = useAdminHRUserValidationMessages()
  return createUpdateAdminHRUserSchema(messages)
}
