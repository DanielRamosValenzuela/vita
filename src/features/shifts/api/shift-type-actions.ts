'use server'

import { requireAdminHROrChiefArea, requireAdminHRWithOrg } from '@/src/shared/lib/auth'
import { isChiefArea } from '@/src/shared/lib/auth/rbac'
import { prisma } from '@/src/shared/lib/db'
import type { ActionResult } from '@/src/shared/lib/types'
import { handleActionError } from '@/src/shared/lib/utils'
import { revalidatePaths } from '@/src/shared/lib/utils/revalidate-paths'

const SHIFT_TYPES_PATHS = ['/dashboard/shift-types'] as const

type ShiftClassification = 'DAY' | 'NIGHT' | 'MIXED'

interface ShiftType {
  id: string
  name: string
  description?: string | undefined
  icon?: string | null
  durationMinutes: number
  classification: ShiftClassification
  color: string
  minStaffRequired: number
  idealStaffCount: number
  maxStaffAllowed: number
  suggestedRestDays: number
  isGlobal: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  _count?: {
    shifts: number
    areaShiftTypes: number
  }
  areaShiftTypes?: Array<{
    areaId: string
    isActive: boolean
    area: { id: string; name: string }
  }>
}

export const getShiftTypesAction = async (): Promise<ActionResult<ShiftType[]>> => {
  try {
    const session = await requireAdminHROrChiefArea()
    let orgId: string | null = session.organizationId ?? null
    if (isChiefArea(session) && !orgId) {
      const firstArea = await prisma.userArea.findFirst({
        where: { userId: session.id },
        select: { area: { select: { organizationId: true } } },
      })
      const derived: string | null = firstArea?.area?.organizationId ?? null
      orgId = derived
    }
    if (!orgId)
      return {
        success: false,
        error: 'No tienes una organización asignada',
      }

    const effectiveOrgId = orgId
    const where: {
      organizationId: string
      OR?: Array<
        | { isGlobal: boolean }
        | { areaShiftTypes: { some: { areaId: { in: string[] }; isActive: boolean } } }
      >
    } = {
      organizationId: effectiveOrgId,
    }

    if (isChiefArea(session)) {
      const chiefAreas = await prisma.userArea.findMany({
        where: { userId: session.id },
        select: { areaId: true },
      })
      const chiefAreaIds = chiefAreas.map((a) => a.areaId)
      if (chiefAreaIds.length === 0) return { success: true, data: [] }
      where.OR = [
        { isGlobal: true },
        {
          areaShiftTypes: {
            some: {
              areaId: { in: chiefAreaIds },
              isActive: true,
            },
          },
        },
        {
          areaShiftTypes: {
            some: {
              areaId: { in: chiefAreaIds },
              isActive: false,
            },
          },
        },
      ]
    }

    const shiftTypes = await prisma.shiftType.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { shifts: true, areaShiftTypes: true } },
        areaShiftTypes: {
          select: { areaId: true, isActive: true, area: { select: { id: true, name: true } } },
        },
      },
    })

    const formattedShiftTypes = shiftTypes.map((type) => ({
      ...type,
      description: type.description || undefined,
    }))

    return {
      success: true,
      data: formattedShiftTypes,
    }
  } catch (error) {
    return handleActionError(error, 'getShiftTypesAction', 'Error al obtener tipos de turno')
  }
}

export const createShiftTypeAction = async (data: {
  name: string
  description?: string
  icon?: string
  durationMinutes: number
  classification?: ShiftClassification
  color?: string
  minStaffRequired?: number
  idealStaffCount?: number
  maxStaffAllowed?: number
  suggestedRestDays?: number
  isGlobal?: boolean
  isActive?: boolean
  areaConfigs?: Array<{ areaId: string; isActive: boolean }>
}): Promise<ActionResult<ShiftType>> => {
  try {
    const session = await requireAdminHRWithOrg()

    const color = data.color ?? '#3b82f6'
    const colorRegex = /^#[0-9A-Fa-f]{6}$/
    if (!colorRegex.test(color))
      return {
        success: false,
        error: 'El color debe estar en formato hexadecimal (ej: #3b82f6)',
      }

    if (data.durationMinutes < 30 || data.durationMinutes > 1440)
      return {
        success: false,
        error: 'La duración debe estar entre 30 minutos y 24 horas (1440 min)',
      }

    const isGlobal = data.isGlobal ?? true
    const areaConfigs = data.areaConfigs ?? []
    if (!isGlobal && areaConfigs.length === 0)
      return {
        success: false,
        error: 'Si el tipo no es global, debes seleccionar al menos un área',
      }

    if (!isGlobal && areaConfigs.length > 0) {
      const areaIds = areaConfigs.map((c) => c.areaId)
      const areasInOrg = await prisma.area.count({
        where: {
          id: { in: areaIds },
          organizationId: session.organizationId,
        },
      })
      if (areasInOrg !== areaIds.length)
        return {
          success: false,
          error: 'Una o más áreas no pertenecen a tu organización',
        }
    }

    const existingType = await prisma.shiftType.findFirst({
      where: {
        name: data.name,
        organizationId: session.organizationId,
      },
    })

    if (existingType)
      return {
        success: false,
        error: 'Ya existe un tipo de turno con ese nombre en tu organización',
      }

    const shiftType = await prisma.shiftType.create({
      data: {
        name: data.name,
        description: data.description || null,
        icon: data.icon ?? 'Clock',
        durationMinutes: data.durationMinutes,
        classification: data.classification ?? 'DAY',
        color,
        minStaffRequired: data.minStaffRequired ?? 1,
        idealStaffCount: data.idealStaffCount ?? 1,
        maxStaffAllowed: data.maxStaffAllowed ?? 10,
        suggestedRestDays: data.suggestedRestDays ?? 1,
        isGlobal,
        isActive: data.isActive ?? true,
        organizationId: session.organizationId,
      },
      include: {
        _count: { select: { shifts: true, areaShiftTypes: true } },
        areaShiftTypes: {
          select: { areaId: true, isActive: true, area: { select: { id: true, name: true } } },
        },
      },
    })

    if (!isGlobal && areaConfigs.length > 0)
      await prisma.areaShiftType.createMany({
        data: areaConfigs.map((c) => ({
          areaId: c.areaId,
          shiftTypeId: shiftType.id,
          isActive: false,
        })),
      })

    revalidatePaths(...SHIFT_TYPES_PATHS)

    const withAreas = await prisma.shiftType.findUnique({
      where: { id: shiftType.id },
      include: {
        _count: { select: { shifts: true, areaShiftTypes: true } },
        areaShiftTypes: {
          select: { areaId: true, isActive: true, area: { select: { id: true, name: true } } },
        },
      },
    })

    return {
      success: true,
      data: {
        ...withAreas!,
        description: withAreas!.description ?? undefined,
      },
      message: 'Tipo de turno creado exitosamente',
    }
  } catch (error) {
    return handleActionError(error, 'createShiftTypeAction', 'Error al crear tipo de turno')
  }
}

export const updateShiftTypeAction = async (
  id: string,
  data: {
    name?: string
    description?: string
    icon?: string
    durationMinutes?: number
    classification?: ShiftClassification
    color?: string
    minStaffRequired?: number
    idealStaffCount?: number
    maxStaffAllowed?: number
    suggestedRestDays?: number
    isGlobal?: boolean
    isActive?: boolean
    areaConfigs?: Array<{ areaId: string; isActive: boolean }>
  }
): Promise<ActionResult<ShiftType>> => {
  try {
    const session = await requireAdminHRWithOrg()

    if (data.color) {
      const colorRegex = /^#[0-9A-Fa-f]{6}$/
      if (!colorRegex.test(data.color))
        return {
          success: false,
          error: 'El color debe estar en formato hexadecimal (ej: #3b82f6)',
        }
    }

    if (
      data.durationMinutes !== undefined &&
      (data.durationMinutes < 30 || data.durationMinutes > 1440)
    )
      return {
        success: false,
        error: 'La duración debe estar entre 30 minutos y 24 horas (1440 min)',
      }

    const existingType = await prisma.shiftType.findUnique({
      where: { id },
    })

    if (!existingType)
      return {
        success: false,
        error: 'Tipo de turno no encontrado',
      }

    if (existingType.organizationId !== session.organizationId)
      return {
        success: false,
        error: 'El tipo de turno no pertenece a tu organización',
      }

    const isGlobal = data.isGlobal ?? existingType.isGlobal
    const areaConfigs = data.areaConfigs ?? []
    if (!isGlobal && areaConfigs.length === 0)
      return {
        success: false,
        error: 'Si el tipo no es global, debes seleccionar al menos un área',
      }

    if (!isGlobal && areaConfigs.length > 0) {
      const areaIds = areaConfigs.map((c) => c.areaId)
      const areasInOrg = await prisma.area.count({
        where: {
          id: { in: areaIds },
          organizationId: session.organizationId,
        },
      })
      if (areasInOrg !== areaIds.length)
        return {
          success: false,
          error: 'Una o más áreas no pertenecen a tu organización',
        }
    }

    if (data.name && data.name !== existingType.name) {
      const duplicateType = await prisma.shiftType.findFirst({
        where: {
          name: data.name,
          organizationId: session.organizationId,
          id: { not: id },
        },
      })

      if (duplicateType)
        return {
          success: false,
          error: 'Ya existe un tipo de turno con ese nombre en tu organización',
        }
    }

    const { areaConfigs: _areaConfigs, ...updateData } = data
    await prisma.shiftType.update({
      where: { id },
      data: updateData,
    })

    await prisma.areaShiftType.deleteMany({ where: { shiftTypeId: id } })
    if (!isGlobal && areaConfigs.length > 0)
      await prisma.areaShiftType.createMany({
        data: areaConfigs.map((c) => ({
          areaId: c.areaId,
          shiftTypeId: id,
          isActive: false,
        })),
      })

    revalidatePaths(...SHIFT_TYPES_PATHS)

    const withAreas = await prisma.shiftType.findUnique({
      where: { id },
      include: {
        _count: { select: { shifts: true, areaShiftTypes: true } },
        areaShiftTypes: {
          select: { areaId: true, isActive: true, area: { select: { id: true, name: true } } },
        },
      },
    })

    return {
      success: true,
      data: {
        ...withAreas!,
        description: withAreas!.description ?? undefined,
      },
      message: 'Tipo de turno actualizado exitosamente',
    }
  } catch (error) {
    return handleActionError(error, 'updateShiftTypeAction', 'Error al actualizar tipo de turno')
  }
}

export const deleteShiftTypeAction = async (id: string): Promise<ActionResult<null>> => {
  try {
    const session = await requireAdminHRWithOrg()

    const existingType = await prisma.shiftType.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            shifts: true,
          },
        },
      },
    })

    if (!existingType)
      return {
        success: false,
        error: 'Tipo de turno no encontrado',
      }

    if (existingType.organizationId !== session.organizationId)
      return {
        success: false,
        error: 'El tipo de turno no pertenece a tu organización',
      }

    if (existingType._count.shifts > 0)
      return {
        success: false,
        error: 'No se puede eliminar el tipo de turno porque hay turnos asociados',
      }

    await prisma.shiftType.delete({
      where: { id },
    })

    revalidatePaths(...SHIFT_TYPES_PATHS)

    return {
      success: true,
      message: 'Tipo de turno eliminado exitosamente',
    }
  } catch (error) {
    return handleActionError(error, 'deleteShiftTypeAction', 'Error al eliminar tipo de turno')
  }
}
