export type { ChangePasswordInput, UpdateDocumentInput } from '../types'
export {
  getUpdateProfileSchema,
  getChangePasswordSchema,
  getUpdateDocumentSchema,
} from '../helpers/server'
export { useChangePasswordSchema, useUpdateDocumentSchema } from '../helpers/client'
