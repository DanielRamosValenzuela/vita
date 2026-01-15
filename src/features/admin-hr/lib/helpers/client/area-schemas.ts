'use client'

import { createAreaSchema, createUpdateAreaSchema } from '../../schemas/admin-hr-schema'
import { useAreaValidationMessages } from '../../validation/client/area-messages'

export function useCreateAreaSchema() {
  const messages = useAreaValidationMessages()
  return createAreaSchema(messages)
}

export function useUpdateAreaSchema() {
  const messages = useAreaValidationMessages()
  return createUpdateAreaSchema(messages)
}
