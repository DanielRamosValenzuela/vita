import { prisma } from '@/src/shared/lib/db'
import { revalidatePaths } from '@/src/shared/lib/utils/revalidate-paths'

export async function executeSwap(requesterShiftId: string, targetShiftId: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const [requesterShift, targetShift] = await Promise.all([
      tx.shift.findUniqueOrThrow({
        where: { id: requesterShiftId },
        select: { userId: true },
      }),
      tx.shift.findUniqueOrThrow({
        where: { id: targetShiftId },
        select: { userId: true },
      }),
    ])

    await Promise.all([
      tx.shift.update({
        where: { id: requesterShiftId },
        data: { userId: targetShift.userId },
      }),
      tx.shift.update({
        where: { id: targetShiftId },
        data: { userId: requesterShift.userId },
      }),
    ])
  })

  revalidatePaths('/dashboard', '/dashboard/requests', '/dashboard/shifts')
}
