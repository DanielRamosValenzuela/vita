import { createUpdateAdminHRUserSchema } from '../../schemas/admin-hr-user-schema'
import { getAdminHRUserValidationMessages } from '../../validation/server/admin-hr-user-messages'

export async function getUpdateAdminHRUserSchema(locale: string) {
  const messages = await getAdminHRUserValidationMessages(locale)
  return createUpdateAdminHRUserSchema(messages)
}
