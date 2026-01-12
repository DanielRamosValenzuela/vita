import { prisma } from '@/src/shared/lib/auth'
import type { CreateAreaInput, UpdateAreaInput } from './schemas'
import type { Area } from '@/src/shared/lib/types'

export async function getAreas(organizationId: string) {
  return await prisma.area.findMany({
    where: { organizationId },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getAreaById(id: string, organizationId: string) {
  return await prisma.area.findFirst({
    where: { id, organizationId },
  })
}

export async function createArea(data: CreateAreaInput, organizationId: string): Promise<Area> {
  const area = await prisma.area.create({
    data: {
      name: data.name,
      description: data.description || null,
      isActive: data.isActive ?? true,
      organizationId,
    },
  })

  return area
}

export async function updateArea(
  id: string,
  data: UpdateAreaInput,
  organizationId: string
): Promise<Area> {
  const updateData: {
    name?: string
    description?: string | null
    isActive?: boolean
  } = {}

  if (data.name !== undefined) updateData.name = data.name
  if (data.description !== undefined) {
    updateData.description = data.description === '' ? null : data.description
  }
  if (data.isActive !== undefined) updateData.isActive = data.isActive

  const area = await prisma.area.update({
    where: { id, organizationId },
    data: updateData,
  })

  return area
}

export async function deleteArea(id: string, organizationId: string): Promise<void> {
  await prisma.area.delete({
    where: { id, organizationId },
  })
}
