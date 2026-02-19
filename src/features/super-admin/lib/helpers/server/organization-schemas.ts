import {
  createChangeOrganizationStatusSchema,
  createDeleteOrganizationSchema,
  createOrganizationSchema,
  createUpdateOrganizationSchema,
} from '../../schemas/organization-schema'
import { getOrganizationValidationMessages } from '../../validation/server/organization-messages'

export async function getCreateOrganizationSchema(locale: string) {
  const messages = await getOrganizationValidationMessages(locale)
  return createOrganizationSchema(messages)
}

export async function getUpdateOrganizationSchema(locale: string) {
  const messages = await getOrganizationValidationMessages(locale)
  return createUpdateOrganizationSchema(messages)
}

export async function getChangeOrganizationStatusSchema(locale: string) {
  const messages = await getOrganizationValidationMessages(locale)
  return createChangeOrganizationStatusSchema(messages)
}

export async function getDeleteOrganizationSchema(locale: string) {
  const messages = await getOrganizationValidationMessages(locale)
  return createDeleteOrganizationSchema(messages)
}
