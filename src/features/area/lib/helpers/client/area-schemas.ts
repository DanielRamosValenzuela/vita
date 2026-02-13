'use client'

import { createAreaSchema, createUpdateAreaSchema } from '../../schemas/area-schema'
import { useAreaValidationMessages } from '../../validation/client/area-messages'

export function useCreateAreaSchema() {
  const messages = useAreaValidationMessages()
  return createAreaSchema(messages)
}

export function useUpdateAreaSchema() {
  const messages = useAreaValidationMessages()
  return createUpdateAreaSchema(messages)
}
