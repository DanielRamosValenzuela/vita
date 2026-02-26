'use client'

import { createSectorSchema } from '../../schemas/sector-schema'
import { useSectorValidationMessages } from '../../validation/client/sector-messages'

export function useCreateSectorSchema() {
  const messages = useSectorValidationMessages()
  return createSectorSchema(messages)
}
