import { ROLES } from '@/src/shared/lib/constants'
import { prisma } from '@/src/shared/lib/db'

import type { AdminHRDashboardStats } from '../lib'

export async function getAdminHRDashboardStats(
  organizationId: string
): Promise<AdminHRDashboardStats> {
  const now = new Date()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

  const [totalAreas, totalShiftTypes, totalStaff, totalContracts, activeShifts] = await Promise.all(
    [
      prisma.area.count({
        where: { organizationId, isActive: true },
      }),
      prisma.shiftType.count({
        where: { organizationId, isActive: true },
      }),
      prisma.user.count({
        where: {
          organizationId,
          role: {
            in: [ROLES.ADMIN_HR, ROLES.CHIEF_AREA, ROLES.STAFF],
          },
        },
      }),
      prisma.contract.count({
        where: { organizationId, isActive: true },
      }),
      prisma.shift.count({
        where: {
          organizationId,
          startTime: { gte: firstDayOfMonth, lte: lastDayOfMonth },
          status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
        },
      }),
    ]
  )

  return {
    totalAreas,
    totalShiftTypes,
    totalStaff,
    totalContracts,
    activeShifts,
  }
}
