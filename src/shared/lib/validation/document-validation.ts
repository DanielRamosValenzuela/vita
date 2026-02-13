import type { Country, DocType } from '@prisma/client'

import { prisma } from '@/src/shared/lib/db'

export interface DocumentValidationResult {
  valid: boolean
  error?: string
  conflicts?: Array<{
    userId: string
    userName: string
    organizationId: string
    organizationName: string
  }>
}

export async function validateDocumentUniqueInOrganization(
  userId: string,
  country: Country,
  docType: DocType,
  docNumber: string,
  organizationId: string
): Promise<DocumentValidationResult> {
  const cleanDocNumber = docNumber.replace(/[^0-9A-Za-z]/g, '')

  const existingUser = await prisma.user.findFirst({
    where: {
      AND: [
        { country },
        { docType },
        { docNumber: cleanDocNumber },
        { organizationId },
        { id: { not: userId } },
      ],
    },
    select: {
      id: true,
      name: true,
      email: true,
      organization: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })

  if (existingUser)
    return {
      valid: false,
      error: `El documento ${docNumber} ya existe en esta organización (${existingUser.name} - ${existingUser.email})`,
      conflicts: [
        {
          userId: existingUser.id,
          userName: existingUser.name,
          organizationId: existingUser.organization!.id,
          organizationName: existingUser.organization!.name,
        },
      ],
    }

  return { valid: true }
}

export async function validateDocumentUniqueInUserOrganizations(
  userId: string,
  country: Country,
  docType: DocType,
  docNumber: string
): Promise<DocumentValidationResult> {
  const cleanDocNumber = docNumber.replace(/[^0-9A-Za-z]/g, '')

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      organizationId: true,
    },
  })

  if (!user || !user.organizationId) return { valid: true }

  return validateDocumentUniqueInOrganization(
    userId,
    country,
    docType,
    cleanDocNumber,
    user.organizationId
  )
}

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
