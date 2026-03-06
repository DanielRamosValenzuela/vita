import { prisma } from '@/src/shared/lib/db'

export async function getChiefAccessibleAreaIds(userId: string): Promise<string[]> {
  const [directAreas, sectorAreas] = await Promise.all([
    prisma.userArea.findMany({
      where: { userId },
      select: { areaId: true },
    }),
    prisma.sectorArea.findMany({
      where: { sector: { userSectors: { some: { userId } } } },
      select: { areaId: true },
    }),
  ])

  return [...new Set([...directAreas.map((a) => a.areaId), ...sectorAreas.map((sa) => sa.areaId)])]
}

export async function chiefHasAreaAccess(userId: string, areaId: string): Promise<boolean> {
  const directAccess = await prisma.userArea.findFirst({
    where: { userId, areaId },
  })
  if (directAccess) return true

  const sectorAccess = await prisma.sectorArea.findFirst({
    where: {
      areaId,
      sector: { userSectors: { some: { userId } } },
    },
  })
  return !!sectorAccess
}

export async function resolveChiefOrganizationId(
  userId: string,
  sessionOrgId: string | null
): Promise<string | null> {
  if (sessionOrgId) return sessionOrgId

  const firstArea = await prisma.userArea.findFirst({
    where: { userId },
    select: { area: { select: { organizationId: true } } },
  })
  if (firstArea?.area?.organizationId) return firstArea.area.organizationId

  const firstSector = await prisma.userSector.findFirst({
    where: { userId },
    select: { sector: { select: { organizationId: true } } },
  })
  return firstSector?.sector?.organizationId ?? null
}
