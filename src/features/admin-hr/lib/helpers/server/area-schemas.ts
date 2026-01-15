import { createAreaSchema, createUpdateAreaSchema } from '../../schemas/admin-hr-schema'
import { getAreaValidationMessages } from '../../validation/server/area-messages'

export async function getCreateAreaSchema(locale: string) {
  const messages = await getAreaValidationMessages(locale)
  return createAreaSchema(messages)
}

export async function getUpdateAreaSchema(locale: string) {
  const messages = await getAreaValidationMessages(locale)
  return createUpdateAreaSchema(messages)
}
