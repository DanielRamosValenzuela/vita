'use server'

import { requireAdminHRWithOrg } from '@/src/shared/lib/auth'
import { getAdminHRDashboardStats } from '../data'

import type { AdminHRDashboardStats } from '../lib'

export async function getDashboardStatsAction(): Promise<{
  success: boolean
  data?: AdminHRDashboardStats
  error?: string
}> {
  try {
    const session = await requireAdminHRWithOrg()

    const stats = await getAdminHRDashboardStats(session.organizationId)

    return {
      success: true,
      data: stats,
    }
  } catch (error) {
    console.error('[getDashboardStatsAction] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al cargar estadísticas',
    }
  }
}
