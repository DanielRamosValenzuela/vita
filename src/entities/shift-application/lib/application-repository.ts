import type { Prisma } from '@prisma/client'

import { prisma } from '@/src/shared/lib/db'

import type { ShiftApplicationWithRelations } from '../types/application-types'

const APPLICATION_INCLUDE = {
  shift: {
    include: {
      area: { select: { id: true, name: true, color: true } },
      shiftType: { select: { id: true, name: true, color: true, icon: true } },
    },
  },
  user: {
    select: { id: true, name: true, email: true, image: true, customImage: true },
  },
  responder: {
    select: { id: true, name: true },
  },
} satisfies Prisma.ShiftApplicationInclude

export async function createApplication(
  data: Prisma.ShiftApplicationUncheckedCreateInput
): Promise<ShiftApplicationWithRelations> {
  return prisma.shiftApplication.create({
    data,
    include: APPLICATION_INCLUDE,
  })
}

export async function getApplicationsForShift(
  shiftId: string,
  organizationId: string
): Promise<ShiftApplicationWithRelations[]> {
  return prisma.shiftApplication.findMany({
    where: { shiftId, organizationId },
    include: APPLICATION_INCLUDE,
    orderBy: { createdAt: 'desc' },
  })
}

export async function getApplicationsByUser(
  userId: string,
  organizationId: string
): Promise<ShiftApplicationWithRelations[]> {
  return prisma.shiftApplication.findMany({
    where: { userId, organizationId },
    include: APPLICATION_INCLUDE,
    orderBy: { createdAt: 'desc' },
  })
}

export async function updateApplicationStatus(
  id: string,
  organizationId: string,
  status: string,
  respondedBy?: string
) {
  return prisma.shiftApplication.update({
    where: { id },
    data: { status, respondedBy },
    include: APPLICATION_INCLUDE,
  })
}

export async function getPendingApplicationCountForChief(
  areaIds: string[],
  organizationId: string
): Promise<number> {
  return prisma.shiftApplication.count({
    where: {
      organizationId,
      status: 'PENDING',
      shift: {
        areaId: { in: areaIds },
        coverageStatus: 'OPEN_FOR_APPLICATIONS',
      },
    },
  })
}
