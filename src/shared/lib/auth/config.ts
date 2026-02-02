import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { Pool } from 'pg'

import { env, isDev } from '@/src/shared/lib/config'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

let prisma: PrismaClient

try {
  const pool = new Pool({
    connectionString: env.DATABASE_URL,
  })
  const adapter = new PrismaPg(pool)
  prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
      adapter,
      log: isDev ? ['error', 'warn'] : ['error'],
    })
  if (env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
} catch (error) {
  throw error
}

export { prisma }

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password)
          return null

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            include: {
              accounts: {
                where: {
                  provider: 'credentials',
                },
              },
            },
          })

          if (!user)
            return null

          const credentialsAccount = user.accounts.find((acc) => acc.provider === 'credentials')

          if (!credentialsAccount?.access_token)
            return null

          const isValidPassword = await bcrypt.compare(
            credentials.password,
            credentialsAccount.access_token
          )

          if (!isValidPassword)
            return null

          return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image || undefined,
          role: user.role,
          organizationId: user.organizationId || undefined,
          country: user.country || undefined,
          docType: user.docType || undefined,
          docNumber: user.docNumber || undefined,
        }
        } catch (error) {
          console.error('[NextAuth authorize] DB error:', error)
          return null
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.organizationId = user.organizationId
        token.country = user.country
        token.docType = user.docType
        token.docNumber = user.docNumber
      } else if (token.id)
        try {
          const currentUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: {
              role: true,
              organizationId: true,
              country: true,
              docType: true,
              docNumber: true,
            },
          })

          if (currentUser) {
            token.role = currentUser.role
            token.organizationId = currentUser.organizationId || undefined
            token.country = currentUser.country || undefined
            token.docType = currentUser.docType || undefined
            token.docNumber = currentUser.docNumber || undefined
          }
        } catch (error) {
          console.error('[NextAuth jwt] DB error refreshing token:', error)
        }
      
      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id as string
        session.user.role = token.role as Role
        session.user.organizationId = token.organizationId as string | undefined
        session.user.country = token.country
        session.user.docType = token.docType
        session.user.docNumber = token.docNumber
      }
      return session
    },
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },

  debug: isDev,
}
