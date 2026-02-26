import { createSectorSchema, createUpdateSectorSchema } from '../../schemas/sector-schema'
import { getSectorValidationMessages } from '../../validation/server/sector-messages'

export async function getCreateSectorSchema(locale: string) {
  const messages = await getSectorValidationMessages(locale)
  return createSectorSchema(messages)
}

export async function getUpdateSectorSchema(locale: string) {
  const messages = await getSectorValidationMessages(locale)
  return createUpdateSectorSchema(messages)
}
