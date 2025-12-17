import { Role, Country, DocType } from '@prisma/client'
import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      image?: string
      role: Role
      organizationId?: string
      country?: Country
      docType?: DocType
      docNumber?: string
    }
  }

  interface User {
    id: string
    email: string
    name: string
    image?: string
    role: Role
    organizationId?: string
    country?: Country
    docType?: DocType
    docNumber?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: Role
    organizationId?: string
    country?: Country
    docNumber?: string
  }
}

