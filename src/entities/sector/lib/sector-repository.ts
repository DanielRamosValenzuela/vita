import type { Prisma, Sector } from '@prisma/client'

import { prisma } from '@/src/shared/lib/db'

type CreateSectorInput = Pick<
  Prisma.SectorUncheckedCreateInput,
  'name' | 'description' | 'icon' | 'color'
>

type UpdateSectorInput = Partial<
  Pick<Prisma.SectorUncheckedUpdateInput, 'name' | 'description' | 'icon' | 'color'>
>

export async function getSectors(organizationId: string) {
  return await prisma.sector.findMany({
    where: { organizationId },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { sectorAreas: true } },
      sectorAreas: {
        include: {
          area: {
            select: {
              id: true,
              name: true,
              icon: true,
              color: true,
            },
          },
        },
      },
    },
  })
}

export async function getSectorById(id: string, organizationId: string) {
  return await prisma.sector.findFirst({
    where: { id, organizationId },
    include: {
      sectorAreas: {
        include: {
          area: {
            select: {
              id: true,
              name: true,
              icon: true,
              color: true,
            },
          },
        },
      },
    },
  })
}

export async function createSector(
  data: CreateSectorInput,
  organizationId: string
): Promise<Sector> {
  return await prisma.sector.create({
    data: {
      name: data.name,
      description: data.description || null,
      icon: data.icon ?? 'Layers',
      color: data.color ?? '#3b82f6',
      organizationId,
    },
  })
}

export async function updateSector(
  id: string,
  data: UpdateSectorInput,
  organizationId: string
): Promise<Sector> {
  const updateData: Prisma.SectorUncheckedUpdateInput = {}

  if (data.name !== undefined) updateData.name = data.name
  if (data.description !== undefined)
    updateData.description = data.description === '' ? null : data.description
  if (data.icon !== undefined) updateData.icon = data.icon
  if (data.color !== undefined) updateData.color = data.color

  return await prisma.sector.update({
    where: { id, organizationId },
    data: updateData,
  })
}

export async function deleteSector(id: string, organizationId: string): Promise<void> {
  await prisma.sector.deleteMany({
    where: { id, organizationId },
  })
}
