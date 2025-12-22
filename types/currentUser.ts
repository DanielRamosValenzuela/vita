import { Role } from '@prisma/client'

export interface CurrentUser {
  id: string
  email: string
  name: string
  image?: string
  role: Role
  organizationId?: string
  country?: string
  docType?: string
  docNumber?: string
}

