'use server'

import type { ApplyCondition, ComponentType, ComponentUnit } from '@prisma/client'

import { requireAdminHRWithOrg } from '@/src/shared/lib/auth'
import { prisma } from '@/src/shared/lib/db'
import type { ActionResult } from '@/src/shared/lib/types'
import { handleActionError } from '@/src/shared/lib/utils'
import { revalidatePaths } from '@/src/shared/lib/utils/revalidate-paths'

const RATES_PATHS = ['/dashboard/rates', '/dashboard/staff'] as const

export interface RateComponentData {
  id?: string
  type: ComponentType
  customName?: string | null
  value: number
  unit: ComponentUnit
  applyCondition: ApplyCondition
  conditionValue?: string | null
  description?: string | null
  order?: number
  applicableShiftTypeIds?: string[]
}

export interface RateTemplateWithComponents {
  id: string
  name: string
  description: string | null
  isActive: boolean
  organizationId: string
  createdAt: Date
  updatedAt: Date
  components: RateComponentData[]
  _count?: { contracts: number }
}

export const createRateTemplateAction = async (data: {
  name: string
  description?: string
  components: RateComponentData[]
}): Promise<ActionResult<RateTemplateWithComponents>> => {
  try {
    const session = await requireAdminHRWithOrg()

    if (data.components.length === 0)
      return {
        success: false,
        error: 'Debes añadir al menos un componente a la tarifa',
      }

    const existing = await prisma.rateTemplate.findFirst({
      where: {
        name: data.name,
        organizationId: session.organizationId,
      },
    })

    if (existing)
      return {
        success: false,
        error: 'Ya existe una tarifa con ese nombre en tu organización',
      }

    const template = await prisma.rateTemplate.create({
      data: {
        name: data.name,
        description: data.description || null,
        organizationId: session.organizationId,
        components: {
          create: data.components.map((comp, index) => ({
            type: comp.type,
            customName: comp.customName || null,
            value: comp.value,
            unit: comp.unit,
            applyCondition: comp.applyCondition,
            conditionValue: comp.conditionValue || null,
            description: comp.description || null,
            order: comp.order ?? index,
            applicableShiftTypes: comp.applicableShiftTypeIds
              ? {
                  create: comp.applicableShiftTypeIds.map((shiftTypeId) => ({
                    shiftTypeId,
                  })),
                }
              : undefined,
          })),
        },
      },
      include: {
        components: {
          orderBy: { order: 'asc' },
          include: {
            applicableShiftTypes: {
              include: {
                shiftType: {
                  select: {
                    id: true,
                    name: true,
                    color: true,
                    icon: true,
                  },
                },
              },
            },
          },
        },
        _count: { select: { contracts: true } },
      },
    })

    revalidatePaths(...RATES_PATHS)

    return {
      success: true,
      data: template,
      message: 'Tarifa creada exitosamente',
    }
  } catch (error) {
    return handleActionError(error, 'createRateTemplateAction', 'Error al crear tarifa')
  }
}

export const updateRateTemplateAction = async (
  id: string,
  data: {
    name?: string
    description?: string
    isActive?: boolean
    components?: RateComponentData[]
  }
): Promise<ActionResult<RateTemplateWithComponents>> => {
  try {
    const session = await requireAdminHRWithOrg()

    const existing = await prisma.rateTemplate.findUnique({
      where: { id },
      include: { components: true },
    })

    if (!existing)
      return {
        success: false,
        error: 'Tarifa no encontrada',
      }

    if (existing.organizationId !== session.organizationId)
      return {
        success: false,
        error: 'La tarifa no pertenece a tu organización',
      }

    if (data.name && data.name !== existing.name) {
      const duplicate = await prisma.rateTemplate.findFirst({
        where: {
          name: data.name,
          organizationId: session.organizationId,
          id: { not: id },
        },
      })
      if (duplicate)
        return {
          success: false,
          error: 'Ya existe una tarifa con ese nombre en tu organización',
        }
    }

    if (data.components && data.components.length === 0)
      return {
        success: false,
        error: 'Debes tener al menos un componente en la tarifa',
      }

    const updated = await prisma.rateTemplate.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description !== undefined ? data.description : undefined,
        isActive: data.isActive,
        components: data.components
          ? {
              deleteMany: {},
              create: data.components.map((comp, index) => ({
                type: comp.type,
                customName: comp.customName || null,
                value: comp.value,
                unit: comp.unit,
                applyCondition: comp.applyCondition,
                conditionValue: comp.conditionValue || null,
                description: comp.description || null,
                order: comp.order ?? index,
                applicableShiftTypes: comp.applicableShiftTypeIds
                  ? {
                      create: comp.applicableShiftTypeIds.map((shiftTypeId) => ({
                        shiftTypeId,
                      })),
                    }
                  : undefined,
              })),
            }
          : undefined,
      },
      include: {
        components: {
          orderBy: { order: 'asc' },
          include: {
            applicableShiftTypes: {
              include: {
                shiftType: {
                  select: {
                    id: true,
                    name: true,
                    color: true,
                    icon: true,
                  },
                },
              },
            },
          },
        },
        _count: { select: { contracts: true } },
      },
    })

    revalidatePaths(...RATES_PATHS)

    return {
      success: true,
      data: updated,
      message: 'Tarifa actualizada exitosamente',
    }
  } catch (error) {
    return handleActionError(error, 'updateRateTemplateAction', 'Error al actualizar tarifa')
  }
}

export const duplicateRateTemplateAction = async (
  id: string,
  newName: string
): Promise<ActionResult<RateTemplateWithComponents>> => {
  try {
    const session = await requireAdminHRWithOrg()

    const original = await prisma.rateTemplate.findUnique({
      where: { id },
      include: {
        components: {
          orderBy: { order: 'asc' },
          include: {
            applicableShiftTypes: true,
          },
        },
      },
    })

    if (!original)
      return { success: false, error: 'Tarifa no encontrada' }

    if (original.organizationId !== session.organizationId)
      return { success: false, error: 'La tarifa no pertenece a tu organización' }

    const duplicate = await prisma.rateTemplate.create({
      data: {
        name: newName,
        description: original.description,
        organizationId: session.organizationId,
        components: {
          create: original.components.map((comp, index) => ({
            type: comp.type,
            customName: comp.customName,
            value: comp.value,
            unit: comp.unit,
            applyCondition: comp.applyCondition,
            conditionValue: comp.conditionValue,
            description: comp.description,
            order: comp.order ?? index,
            applicableShiftTypes: comp.applicableShiftTypes.length > 0
              ? {
                  create: comp.applicableShiftTypes.map((st) => ({
                    shiftTypeId: st.shiftTypeId,
                  })),
                }
              : undefined,
          })),
        },
      },
      include: {
        components: {
          orderBy: { order: 'asc' },
          include: {
            applicableShiftTypes: {
              include: {
                shiftType: {
                  select: { id: true, name: true, color: true, icon: true },
                },
              },
            },
          },
        },
        _count: { select: { contracts: true } },
      },
    })

    revalidatePaths(...RATES_PATHS)

    return {
      success: true,
      data: duplicate,
      message: 'Tarifa duplicada exitosamente',
    }
  } catch (error) {
    return handleActionError(error, 'duplicateRateTemplateAction', 'Error al duplicar tarifa')
  }
}

export const deleteRateTemplateAction = async (id: string): Promise<ActionResult<null>> => {
  try {
    const session = await requireAdminHRWithOrg()

    const existing = await prisma.rateTemplate.findUnique({
      where: { id },
      include: {
        _count: { select: { contracts: true } },
      },
    })

    if (!existing)
      return {
        success: false,
        error: 'Tarifa no encontrada',
      }

    if (existing.organizationId !== session.organizationId)
      return {
        success: false,
        error: 'La tarifa no pertenece a tu organización',
      }

    if (existing._count.contracts > 0)
      return {
        success: false,
        error: 'No se puede eliminar: tiene contratos asociados',
      }

    await prisma.rateTemplate.delete({
      where: { id },
    })

    revalidatePaths(...RATES_PATHS)

    return {
      success: true,
      message: 'Tarifa eliminada exitosamente',
    }
  } catch (error) {
    return handleActionError(error, 'deleteRateTemplateAction', 'Error al eliminar tarifa')
  }
}

