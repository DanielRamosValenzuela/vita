import { createLoginSchema, createRegisterSchema } from '../../schemas/auth-schema'
import { getValidationMessages } from '../../validation/server/auth-messages'

export async function getRegisterSchema(locale: string) {
  const messages = await getValidationMessages(locale)
  return createRegisterSchema(messages)
}

export async function getLoginSchema(locale: string) {
  const messages = await getValidationMessages(locale)
  return createLoginSchema(messages)
}
