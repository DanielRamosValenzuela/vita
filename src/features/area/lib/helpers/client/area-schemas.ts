'use client'

import { createAreaSchema } from '../../schemas/area-schema'
import { useAreaValidationMessages } from '../../validation/client/area-messages'

export function useCreateAreaSchema() {
  const messages = useAreaValidationMessages()
  return createAreaSchema(messages)
}
