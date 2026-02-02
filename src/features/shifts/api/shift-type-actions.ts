'use server'

import { revalidatePath } from 'next/cache'

import { prisma } from '@/src/shared/lib/auth/config'
import { requireAdminHR } from '@/src/shared/lib/auth/session'
import type { ActionResult } from '@/src/shared/lib/types'

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
}

export const getShiftTypesAction = async (): Promise<ActionResult<ShiftType[]>> => {
  try {
    const session = await requireAdminHR()
    if (!session.organizationId)
      return {
        success: false,
        error: 'No tienes una organización asignada',
      }

    const shiftTypes = await prisma.shiftType.findMany({
      where: { organizationId: session.organizationId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { shifts: true, areaShiftTypes: true } },
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
    console.error('[getShiftTypesAction] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener tipos de turno',
    }
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
}): Promise<ActionResult<ShiftType>> => {
  try {
    const session = await requireAdminHR()
    if (!session.organizationId)
      return {
        success: false,
        error: 'No tienes una organización asignada',
      }

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
        isGlobal: data.isGlobal ?? true,
        isActive: data.isActive ?? true,
        organizationId: session.organizationId,
      },
      include: {
        _count: { select: { shifts: true, areaShiftTypes: true } },
      },
    })

    revalidatePath('/dashboard/shift-types')

    return {
      success: true,
      data: {
        ...shiftType,
        description: shiftType.description ?? undefined,
      },
      message: 'Tipo de turno creado exitosamente',
    }
  } catch (error) {
    console.error('[createShiftTypeAction] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al crear tipo de turno',
    }
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
  }
): Promise<ActionResult<ShiftType>> => {
  try {
    const session = await requireAdminHR()
    if (!session.organizationId)
      return {
        success: false,
        error: 'No tienes una organización asignada',
      }

    if (data.color) {
      const colorRegex = /^#[0-9A-Fa-f]{6}$/
      if (!colorRegex.test(data.color))
        return {
          success: false,
          error: 'El color debe estar en formato hexadecimal (ej: #3b82f6)',
        }
    }

    if (data.durationMinutes !== undefined && (data.durationMinutes < 30 || data.durationMinutes > 1440))
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

    const updatedShiftType = await prisma.shiftType.update({
      where: { id },
      data,
      include: {
        _count: { select: { shifts: true, areaShiftTypes: true } },
      },
    })

    revalidatePath('/dashboard/shift-types')

    return {
      success: true,
      data: {
        ...updatedShiftType,
        description: updatedShiftType.description ?? undefined,
      },
      message: 'Tipo de turno actualizado exitosamente',
    }
  } catch (error) {
    console.error('[updateShiftTypeAction] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al actualizar tipo de turno',
    }
  }
}

export const deleteShiftTypeAction = async (id: string): Promise<ActionResult<null>> => {
  try {
    const session = await requireAdminHR()
    if (!session.organizationId)
      return {
        success: false,
        error: 'No tienes una organización asignada',
      }

    
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

    revalidatePath('/dashboard/shift-types')

    return {
      success: true,
      message: 'Tipo de turno eliminado exitosamente',
    }
  } catch (error) {
    console.error('[deleteShiftTypeAction] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al eliminar tipo de turno',
    }
  }
}
