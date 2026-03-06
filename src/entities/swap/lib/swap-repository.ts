import type { Prisma, SwapRequestStatus } from '@prisma/client'

import { prisma } from '@/src/shared/lib/db'

import type { SwapRequestWithRelations } from '../types/swap-types'

const SWAP_REQUEST_INCLUDE = {
  requester: {
    select: { id: true, name: true, email: true, image: true, customImage: true },
  },
  targetUser: {
    select: { id: true, name: true, email: true, image: true, customImage: true },
  },
  chief: {
    select: { id: true, name: true },
  },
  requesterShift: {
    include: {
      area: { select: { id: true, name: true, color: true } },
      shiftType: { select: { id: true, name: true, color: true, icon: true } },
    },
  },
  targetShift: {
    include: {
      area: { select: { id: true, name: true, color: true } },
      shiftType: { select: { id: true, name: true, color: true, icon: true } },
    },
  },
  area: {
    select: { id: true, name: true, color: true },
  },
  offers: {
    include: {
      offerer: {
        select: { id: true, name: true, email: true, image: true, customImage: true },
      },
      offeredShift: {
        include: {
          shiftType: { select: { id: true, name: true, color: true, icon: true } },
        },
      },
    },
  },
} satisfies Prisma.ShiftSwapRequestInclude

export async function createSwapRequest(
  data: Prisma.ShiftSwapRequestUncheckedCreateInput
): Promise<SwapRequestWithRelations> {
  return prisma.shiftSwapRequest.create({
    data,
    include: SWAP_REQUEST_INCLUDE,
  })
}

export async function getSwapRequestById(
  id: string,
  organizationId: string
): Promise<SwapRequestWithRelations | null> {
  return prisma.shiftSwapRequest.findFirst({
    where: { id, organizationId },
    include: SWAP_REQUEST_INCLUDE,
  })
}

export async function getSwapRequestsForUser(
  userId: string,
  organizationId: string,
  filter?: { type?: 'sent' | 'received' | 'open'; status?: SwapRequestStatus }
): Promise<SwapRequestWithRelations[]> {
  const where: Prisma.ShiftSwapRequestWhereInput = { organizationId }

  if (filter?.status) where.status = filter.status

  if (filter?.type === 'sent')
    where.requesterId = userId
  else if (filter?.type === 'received')
    where.OR = [
      { targetUserId: userId },
      { type: 'OPEN', offers: { some: { offererId: userId } } },
    ]
  else if (filter?.type === 'open') {
    where.type = 'OPEN'
    where.status = 'PENDING_PEER'
    where.requesterId = { not: userId }
  } else
    where.OR = [
      { requesterId: userId },
      { targetUserId: userId },
      { type: 'OPEN', offers: { some: { offererId: userId } } },
    ]

  return prisma.shiftSwapRequest.findMany({
    where,
    include: SWAP_REQUEST_INCLUDE,
    orderBy: { createdAt: 'desc' },
  })
}

export async function getSwapRequestsForChief(
  areaIds: string[],
  organizationId: string
): Promise<SwapRequestWithRelations[]> {
  return prisma.shiftSwapRequest.findMany({
    where: {
      organizationId,
      areaId: { in: areaIds },
      status: 'PENDING_CHIEF',
    },
    include: SWAP_REQUEST_INCLUDE,
    orderBy: { createdAt: 'desc' },
  })
}

export async function updateSwapStatus(
  id: string,
  organizationId: string,
  data: Prisma.ShiftSwapRequestUncheckedUpdateInput
): Promise<SwapRequestWithRelations> {
  return prisma.shiftSwapRequest.update({
    where: { id },
    data: { ...data, organizationId: undefined },
    include: SWAP_REQUEST_INCLUDE,
  })
}

export async function createSwapOffer(
  data: Prisma.ShiftSwapOfferUncheckedCreateInput
) {
  return prisma.shiftSwapOffer.create({ data })
}

async function getOffersForRequest(swapRequestId: string) {
  return prisma.shiftSwapOffer.findMany({
    where: { swapRequestId },
    include: {
      offerer: {
        select: { id: true, name: true, email: true, image: true, customImage: true },
      },
      offeredShift: {
        include: {
          area: { select: { id: true, name: true, color: true } },
          shiftType: { select: { id: true, name: true, color: true, icon: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function updateOfferStatus(
  id: string,
  status: 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN'
) {
  return prisma.shiftSwapOffer.update({
    where: { id },
    data: { status },
  })
}

export async function getPendingSwapCountForUser(
  userId: string,
  organizationId: string
): Promise<number> {
  const [peerPending, chiefPending] = await Promise.all([
    prisma.shiftSwapRequest.count({
      where: {
        organizationId,
        targetUserId: userId,
        status: 'PENDING_PEER',
      },
    }),
    prisma.shiftSwapRequest.count({
      where: {
        organizationId,
        requesterId: userId,
        type: 'OPEN',
        status: 'PENDING_SELECTION',
      },
    }),
  ])
  return peerPending + chiefPending
}

async function hasActiveSwapForShift(shiftId: string): Promise<boolean> {
  const count = await prisma.shiftSwapRequest.count({
    where: {
      OR: [
        { requesterShiftId: shiftId },
        { targetShiftId: shiftId },
      ],
      status: {
        in: ['PENDING_PEER', 'PENDING_SELECTION', 'PENDING_CHIEF'],
      },
    },
  })
  return count > 0
}
