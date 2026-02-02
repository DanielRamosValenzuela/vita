'use server'

import { revalidatePath } from 'next/cache'

import { prisma } from '@/src/shared/lib/auth/config'
import { requireAdminHR } from '@/src/shared/lib/auth/session'
import type { ActionResult } from '@/src/shared/lib/types'

export const assignShiftTypesToAreaAction = async (
  areaId: string,
  shiftTypeIds: string[]
): Promise<ActionResult<null>> => {
  try {
    const session = await requireAdminHR()
    if (!session.organizationId)
      return {
        success: false,
        error: 'No tienes una organización asignada',
      }

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

    await prisma.areaShiftType.deleteMany({
      where: { areaId },
    })

    if (validIds.length > 0)
      await prisma.areaShiftType.createMany({
        data: validIds.map((shiftTypeId) => ({ areaId, shiftTypeId })),
      })

    const canActivate = validIds.length > 0
    await prisma.area.update({
      where: { id: areaId },
      data: {
        isActive: canActivate ? area.isActive : false,
      },
    })

    revalidatePath('/dashboard/areas')
    revalidatePath('/dashboard/admin-hr')

    return {
      success: true,
      message: 'Tipos de turno asignados correctamente',
    }
  } catch (error) {
    console.error('[assignShiftTypesToAreaAction] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al asignar tipos de turno',
    }
  }
}

export const setAreaActiveAction = async (
  areaId: string,
  isActive: boolean
): Promise<ActionResult<null>> => {
  try {
    const session = await requireAdminHR()
    if (!session.organizationId)
      return {
        success: false,
        error: 'No tienes una organización asignada',
      }

    const area = await prisma.area.findFirst({
      where: { id: areaId, organizationId: session.organizationId },
      include: {
        _count: { select: { shiftTypes: true } },
      },
    })

    if (!area)
      return {
        success: false,
        error: 'Área no encontrada',
      }

    if (isActive && area._count.shiftTypes === 0)
      return {
        success: false,
        error: 'Asigna al menos un tipo de turno para activar el área',
      }

    await prisma.area.update({
      where: { id: areaId },
      data: { isActive },
    })

    revalidatePath('/dashboard/areas')
    revalidatePath('/dashboard/admin-hr')

    return {
      success: true,
      message: isActive ? 'Área activada' : 'Área desactivada',
    }
  } catch (error) {
    console.error('[setAreaActiveAction] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al actualizar estado',
    }
  }
}
