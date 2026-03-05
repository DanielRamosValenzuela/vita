import type { Prisma } from '@prisma/client'

export type ShiftApplicationWithRelations = Prisma.ShiftApplicationGetPayload<{
  include: {
    shift: {
      include: {
        area: { select: { id: true; name: true; color: true } }
        shiftType: { select: { id: true; name: true; color: true; icon: true } }
      }
    }
    user: { select: { id: true; name: true; email: true; image: true; customImage: true } }
    responder: { select: { id: true; name: true } }
  }
}>
