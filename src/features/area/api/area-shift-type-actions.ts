'use server'

import { requireAdminHROrChief } from '@/src/shared/lib/auth'
import { isChiefArea } from '@/src/shared/lib/auth/rbac'
import { prisma } from '@/src/shared/lib/db'
import type { ActionResult } from '@/src/shared/lib/types'
import { handleActionError } from '@/src/shared/lib/utils'
import { revalidatePaths } from '@/src/shared/lib/utils/revalidate-paths'

const AREA_PATHS = ['/dashboard/areas', '/dashboard/admin-hr'] as const

async function resolveOrgIdAndCheckArea(
  areaId: string
): Promise<{ success: false; error: string } | { success: true; organizationId: string }> {
  const user = await requireAdminHROrChief()
  let orgId: string | null = user.organizationId ?? null
  if (isChiefArea(user) && !orgId) {
    const firstArea = await prisma.userArea.findFirst({
      where: { userId: user.id },
      select: { area: { select: { organizationId: true } } },
    })
    orgId = firstArea?.area?.organizationId ?? null
  }
  if (!orgId) return { success: false, error: 'No tienes una organización asignada' }

  const area = await prisma.area.findFirst({
    where: { id: areaId, organizationId: orgId },
  })
  if (!area) return { success: false, error: 'Área no encontrada' }

  if (isChiefArea(user)) {
    const chiefArea = await prisma.userArea.findFirst({
      where: { userId: user.id, areaId },
    })
    if (!chiefArea) return { success: false, error: 'No tienes permiso para editar esta área' }
  }

  return { success: true, organizationId: orgId }
}

export const assignShiftTypesToAreaAction = async (
  areaId: string,
  shiftTypeIds: string[]
): Promise<ActionResult<null>> => {
  try {
    const check = await resolveOrgIdAndCheckArea(areaId)
    if (!check.success) return { success: false, error: check.error }

    const area = await prisma.area.findFirst({
      where: { id: areaId, organizationId: check.organizationId },
    })

    if (!area)
      return {
        success: false,
        error: 'Área no encontrada',
      }

    const validShiftTypes = await prisma.shiftType.findMany({
      where: {
        id: { in: shiftTypeIds },
        organizationId: check.organizationId,
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
    const check = await resolveOrgIdAndCheckArea(areaId)
    if (!check.success) return { success: false, error: check.error }

    const area = await prisma.area.findFirst({
      where: { id: areaId, organizationId: check.organizationId },
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
    return handleActionError(error, 'setAreaActiveAction', 'Error al actualizar estado')
  }
}
