'use server'

import { prisma } from '@/src/shared/lib/auth/config'
import { requireAdminHRWithOrg } from '@/src/shared/lib/auth'
import type { ActionResult } from '@/src/shared/lib/types'
import { handleActionError } from '@/src/shared/lib/utils'
import { revalidatePaths } from '@/src/shared/lib/utils/revalidate-paths'

const AREA_PATHS = ['/dashboard/areas', '/dashboard/admin-hr'] as const

export const assignShiftTypesToAreaAction = async (
  areaId: string,
  shiftTypeIds: string[]
): Promise<ActionResult<null>> => {
  try {
    const session = await requireAdminHRWithOrg()

    const area = await prisma.area.findFirst({
      where: { id: areaId, organizationId: session.organizationId },
    })

    if (!area)
      return {
        success: false,
        error: 'Área no encontrada',
      }

    const validShiftTypes = await prisma.shiftType.findMany({
      where: {
        id: { in: shiftTypeIds },
        organizationId: session.organizationId,
        isActive: true,
      },
      select: { id: true },
    })

    const validIds = validShiftTypes.map((st) => st.id)

    await Promise.all(
      validIds.map((shiftTypeId) =>
        prisma.areaShiftType.upsert({
          where: {
            areaId_shiftTypeId: { areaId, shiftTypeId },
          },
          create: { areaId, shiftTypeId, isActive: true },
          update: { isActive: true },
        })
      )
    )

    await prisma.areaShiftType.updateMany({
      where: {
        areaId,
        shiftTypeId: { notIn: validIds },
      },
      data: { isActive: false },
    })

    const assignedCount = await prisma.areaShiftType.count({
      where: { areaId, isActive: true },
    })
    const canActivate = assignedCount > 0
    await prisma.area.update({
      where: { id: areaId },
      data: {
        isActive: canActivate ? area.isActive : false,
      },
    })

    revalidatePaths(...AREA_PATHS)

    return {
      success: true,
      message: 'Tipos de turno asignados correctamente',
    }
  } catch (error) {
    return handleActionError(
      error,
      'assignShiftTypesToAreaAction',
      'Error al asignar tipos de turno'
    )
  }
}

export const setAreaActiveAction = async (
  areaId: string,
  isActive: boolean
): Promise<ActionResult<null>> => {
  try {
    const session = await requireAdminHRWithOrg()

    const area = await prisma.area.findFirst({
      where: { id: areaId, organizationId: session.organizationId },
    })

    if (!area)
      return {
        success: false,
        error: 'Área no encontrada',
      }

    if (isActive) {
      const assignedCount = await prisma.areaShiftType.count({
        where: { areaId, isActive: true },
      })
      if (assignedCount === 0)
        return {
          success: false,
          error: 'Asigna al menos un tipo de turno para activar el área',
        }
    }

    await prisma.area.update({
      where: { id: areaId },
      data: { isActive },
    })

    revalidatePaths(...AREA_PATHS)

    return {
      success: true,
      message: isActive ? 'Área activada' : 'Área desactivada',
    }
  } catch (error) {
    return handleActionError(
      error,
      'setAreaActiveAction',
      'Error al actualizar estado'
    )
  }
}
