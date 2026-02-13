import type { Country, Prisma } from '@prisma/client'

import { prisma } from '@/src/shared/lib/db'

interface SearchUserByDocumentOrEmailParams {
  search: string
  country?: Country
}

export async function searchUserByDocumentOrEmail({
  search,
  country,
}: SearchUserByDocumentOrEmailParams) {
  const cleanSearch = search.trim()

  if (!cleanSearch) return null

  const cleanDocNumber = cleanSearch.replace(/[.-]/g, '')

  const whereConditions: Prisma.UserWhereInput[] = [
    { email: { equals: cleanSearch, mode: 'insensitive' } },
  ]

  if (cleanDocNumber) {
    const docCondition: Prisma.UserWhereInput = { docNumber: cleanDocNumber }
    if (country) docCondition.country = country

    whereConditions.push(docCondition)
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: whereConditions,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      country: true,
      docType: true,
      docNumber: true,
      organizationId: true,
      organization: {
        select: {
          id: true,
          name: true,
        },
      },
      createdAt: true,
    },
  })

  return user
}
