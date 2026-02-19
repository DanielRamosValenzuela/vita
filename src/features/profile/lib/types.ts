import type { Country } from '@prisma/client'

export type ChangePasswordInput = {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export type UpdateDocumentInput = {
  country: Country
  docNumber: string
}
