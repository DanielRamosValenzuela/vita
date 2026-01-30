'use server'

import { revalidatePath } from 'next/cache'

import { prisma } from '@/src/shared/lib/auth/config'
import { requireAdminHR } from '@/src/shared/lib/auth/session'
import type { ActionResult } from '@/src/shared/lib/types'

interface ShiftType {
  id: string
  name: string
  description?: string | undefined
  color: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  _count?: {
    shifts: number
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
        _count: { select: { shifts: true } },
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
  color: string
  isActive?: boolean
}): Promise<ActionResult<ShiftType>> => {
  try {
    const session = await requireAdminHR()
    if (!session.organizationId)
      return {
        success: false,
        error: 'No tienes una organización asignada',
      }

    
    const colorRegex = /^#[0-9A-Fa-f]{6}$/
    if (!colorRegex.test(data.color))
      return {
        success: false,
        error: 'El color debe estar en formato hexadecimal (ej: #3b82f6)',
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
        color: data.color,
        isActive: data.isActive ?? true,
        organizationId: session.organizationId,
      },
    })

    
    const formattedShiftType = {
      ...shiftType,
      description: shiftType.description || undefined,
    }

    revalidatePath('/dashboard/shift-types')

    return {
      success: true,
      data: formattedShiftType,
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
    color?: string
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
    })

    
    const formattedShiftType = {
      ...updatedShiftType,
      description: updatedShiftType.description || undefined,
    }

    revalidatePath('/dashboard/shift-types')
    revalidatePath(`/dashboard/shift-types/${id}`)

    return {
      success: true,
      data: formattedShiftType,
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
