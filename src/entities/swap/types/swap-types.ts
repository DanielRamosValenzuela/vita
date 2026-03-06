import type { Prisma } from '@prisma/client'

export type SwapRequestWithRelations = Prisma.ShiftSwapRequestGetPayload<{
  include: {
    requester: { select: { id: true; name: true; email: true; image: true; customImage: true } }
    targetUser: { select: { id: true; name: true; email: true; image: true; customImage: true } }
    chief: { select: { id: true; name: true } }
    requesterShift: {
      include: {
        area: { select: { id: true; name: true; color: true } }
        shiftType: { select: { id: true; name: true; color: true; icon: true } }
      }
    }
    targetShift: {
      include: {
        area: { select: { id: true; name: true; color: true } }
        shiftType: { select: { id: true; name: true; color: true; icon: true } }
      }
    }
    area: { select: { id: true; name: true; color: true } }
    offers: {
      include: {
        offerer: { select: { id: true; name: true; email: true; image: true; customImage: true } }
        offeredShift: {
          include: {
            shiftType: { select: { id: true; name: true; color: true; icon: true } }
          }
        }
      }
    }
  }
}>

export type SwapOfferWithRelations = Prisma.ShiftSwapOfferGetPayload<{
  include: {
    offerer: { select: { id: true; name: true; email: true; image: true; customImage: true } }
    offeredShift: {
      include: {
        area: { select: { id: true; name: true; color: true } }
        shiftType: { select: { id: true; name: true; color: true; icon: true } }
      }
    }
    swapRequest: { select: { id: true; requesterId: true; status: true } }
  }
}>

export interface SwapRequestFilters {
  status?: string
  type?: 'sent' | 'received' | 'open'
}
