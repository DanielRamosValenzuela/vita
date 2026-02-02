import { prisma } from '@/src/shared/lib/auth/config'
import type { Area } from '@/src/shared/lib/types'

import type { CreateAreaInput, UpdateAreaInput } from '../lib/schemas'

export async function getAreas(organizationId: string) {
  return await prisma.area.findMany({
    where: { organizationId },
    orderBy: { createdAt: 'desc' },
    include: {
      shiftTypes: {
        include: {
          shiftType: { select: { id: true, name: true, durationMinutes: true } },
        },
      },
      _count: { select: { shiftTypes: true } },
    },
  })
}

export async function getAreaById(id: string, organizationId: string) {
  return await prisma.area.findFirst({
    where: { id, organizationId },
    include: {
      shiftTypes: {
        include: {
          shiftType: {
            select: {
              id: true,
              name: true,
              durationMinutes: true,
              classification: true,
              color: true,
            },
          },
        },
      },
    },
  })
}

export async function createArea(data: CreateAreaInput, organizationId: string): Promise<Area> {
  const area = await prisma.area.create({
    data: {
      name: data.name,
      description: data.description || null,
      icon: data.icon ?? 'Building2',
      color: data.color ?? '#3b82f6',
      isActive: false,
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
    icon?: string
    color?: string
    isActive?: boolean
    maxConsecutiveHours?: number | null
    minRestHours?: number | null
  } = {}

  if (data.name !== undefined) updateData.name = data.name
  if (data.description !== undefined)
    updateData.description = data.description === '' ? null : data.description
  if (data.icon !== undefined) updateData.icon = data.icon
  if (data.color !== undefined) updateData.color = data.color
  if (data.maxConsecutiveHours !== undefined) updateData.maxConsecutiveHours = data.maxConsecutiveHours
  if (data.minRestHours !== undefined) updateData.minRestHours = data.minRestHours

  if (data.isActive !== undefined) {
    if (data.isActive) {
      const count = await prisma.areaShiftType.count({ where: { areaId: id } })
      if (count === 0)
        throw new Error('Asigna al menos un tipo de turno para activar el área')
    }
    updateData.isActive = data.isActive
  }

  const area = await prisma.area.update({
    where: { id, organizationId },
    data: updateData,
  })

  return area
}

export async function deleteArea(id: string, organizationId: string): Promise<void> {
  await prisma.area.deleteMany({
    where: { id, organizationId },
  })
}
