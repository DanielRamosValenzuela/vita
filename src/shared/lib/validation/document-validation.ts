import type { Country, DocType } from '@prisma/client'

import { prisma } from '@/src/shared/lib/db'

export async function checkDocumentExistsInOrganization(
  country: Country,
  docType: DocType,
  docNumber: string,
  organizationId: string,
  excludeUserId?: string
): Promise<boolean> {
  const cleanDocNumber = docNumber.replace(/[^0-9A-Za-z]/g, '')

  const whereConditions = {
    country,
    docType,
    docNumber: cleanDocNumber,
    organizationId,
    ...(excludeUserId ? { id: { not: excludeUserId } } : {}),
  }

  const count = await prisma.user.count({
    where: whereConditions,
  })

  return count > 0
}
