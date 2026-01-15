import type { Country } from '@prisma/client'

export type UpdateProfileInput = {
  name: string
  email: string
}

export type ChangePasswordInput = {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export type UpdateDocumentInput = {
  country: Country
  docNumber: string
}
