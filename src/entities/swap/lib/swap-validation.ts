import { prisma } from '@/src/shared/lib/db'

interface SwapValidationResult {
  valid: boolean
  error?: string
}

export async function validateSwapEligibility(
  shiftId: string,
  organizationId: string
): Promise<SwapValidationResult> {
  const shift = await prisma.shift.findFirst({
    where: { id: shiftId, organizationId },
    select: { id: true, status: true, startTime: true, userId: true, areaId: true },
  })

  if (!shift) return { valid: false, error: 'shift_not_found' }

  if (shift.status !== 'SCHEDULED') return { valid: false, error: 'shift_not_scheduled' }

  const twentyFourHoursFromNow = new Date(Date.now() + 24 * 60 * 60 * 1000)
  if (shift.startTime < twentyFourHoursFromNow) return { valid: false, error: 'shift_too_soon' }

  const activeSwap = await prisma.shiftSwapRequest.count({
    where: {
      OR: [{ requesterShiftId: shiftId }, { targetShiftId: shiftId }],
      status: { in: ['PENDING_PEER', 'PENDING_SELECTION', 'PENDING_CHIEF'] },
    },
  })

  if (activeSwap > 0) return { valid: false, error: 'shift_already_in_swap' }

  return { valid: true }
}

export async function validateSameArea(
  shiftAId: string,
  shiftBId: string
): Promise<SwapValidationResult> {
  const [shiftA, shiftB] = await Promise.all([
    prisma.shift.findUnique({ where: { id: shiftAId }, select: { areaId: true } }),
    prisma.shift.findUnique({ where: { id: shiftBId }, select: { areaId: true } }),
  ])

  if (!shiftA || !shiftB) return { valid: false, error: 'shift_not_found' }

  if (shiftA.areaId !== shiftB.areaId) return { valid: false, error: 'different_area' }

  return { valid: true }
}

export async function canUserSwapInArea(userId: string, areaId: string): Promise<boolean> {
  const userArea = await prisma.userArea.findUnique({
    where: { userId_areaId: { userId, areaId } },
  })
  return !!userArea
}

export async function validateNoShiftConflict(
  userId: string,
  startTime: Date,
  endTime: Date,
  excludeShiftId?: string
): Promise<SwapValidationResult> {
  const where: Record<string, unknown> = {
    userId,
    status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
    OR: [
      { startTime: { lte: startTime }, endTime: { gt: startTime } },
      { startTime: { lt: endTime }, endTime: { gte: endTime } },
      { startTime: { gte: startTime }, endTime: { lte: endTime } },
    ],
  }

  if (excludeShiftId) where.id = { not: excludeShiftId }

  const conflict = await prisma.shift.findFirst({ where })
  if (conflict) return { valid: false, error: 'schedule_conflict' }

  return { valid: true }
}
