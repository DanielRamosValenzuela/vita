'use server'

import { prisma } from '@/src/shared/lib/db'
import { requireAdminHRWithOrg } from '@/src/shared/lib/auth'
import type { ActionResult } from '@/src/shared/lib/types'
import { handleActionError } from '@/src/shared/lib/utils'
import { revalidatePaths } from '@/src/shared/lib/utils/revalidate-paths'

const RATES_PATHS = ['/dashboard/rates'] as const

interface RateTemplate {
  id: string
  name: string
  description: string | null
  ratePerMinute: number
  ratePerHour: number | null
  baseSalary: number | null
  baseSalaryUnit: string | null
  isActive: boolean
  organizationId: string
  createdAt: Date
  updatedAt: Date
  _count?: { contracts: number }
}

export const getRateTemplatesAction = async (): Promise<
  ActionResult<RateTemplate[]>
> => {
  try {
    const session = await requireAdminHRWithOrg()

    const templates = await prisma.rateTemplate.findMany({
      where: { organizationId: session.organizationId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { contracts: true } },
      },
    })

    return {
      success: true,
      data: templates.map((r) => ({
        ...r,
        description: r.description ?? null,
      })),
    }
  } catch (error) {
    return handleActionError(
      error,
      'getRateTemplatesAction',
      'Error al obtener tipos de tarifa'
    )
  }
}

export const createRateTemplateAction = async (data: {
  name: string
  description?: string
  ratePerMinute: number
  ratePerHour?: number
  baseSalary?: number
  baseSalaryUnit?: 'MONTHLY' | 'DAILY' | 'HOURLY'
  isActive?: boolean
}): Promise<ActionResult<RateTemplate>> => {
  try {
    const session = await requireAdminHRWithOrg()

    if (data.ratePerMinute < 0)
      return {
        success: false,
        error: 'El monto no puede ser negativo',
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
        error: 'Ya existe un tipo de tarifa con ese nombre en tu organización',
      }

    const ratePerHour = data.ratePerHour ?? data.ratePerMinute * 60

    const template = await prisma.rateTemplate.create({
      data: {
        name: data.name,
        description: data.description || null,
        ratePerMinute: data.ratePerMinute,
        ratePerHour,
        baseSalary: data.baseSalary ?? null,
        baseSalaryUnit: data.baseSalaryUnit ?? null,
        isActive: data.isActive ?? true,
        organizationId: session.organizationId,
      },
      include: {
        _count: { select: { contracts: true } },
      },
    })

    revalidatePaths(...RATES_PATHS)

    return {
      success: true,
      data: template,
      message: 'Tipo de tarifa creado exitosamente',
    }
  } catch (error) {
    return handleActionError(
      error,
      'createRateTemplateAction',
      'Error al crear tipo de tarifa'
    )
  }
}

export const updateRateTemplateAction = async (
  id: string,
  data: {
    name?: string
    description?: string
    ratePerMinute?: number
    ratePerHour?: number
    baseSalary?: number
    baseSalaryUnit?: 'MONTHLY' | 'DAILY' | 'HOURLY'
    isActive?: boolean
  }
): Promise<ActionResult<RateTemplate>> => {
  try {
    const session = await requireAdminHRWithOrg()

    if (data.ratePerMinute !== undefined && data.ratePerMinute < 0)
      return {
        success: false,
        error: 'El monto no puede ser negativo',
      }

    const existing = await prisma.rateTemplate.findUnique({
      where: { id },
    })

    if (!existing)
      return {
        success: false,
        error: 'Tipo de tarifa no encontrado',
      }

    if (existing.organizationId !== session.organizationId)
      return {
        success: false,
        error: 'El tipo de tarifa no pertenece a tu organización',
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
          error: 'Ya existe un tipo de tarifa con ese nombre en tu organización',
        }
    }

    const updated = await prisma.rateTemplate.update({
      where: { id },
      data: {
        ...data,
        ratePerHour:
          data.ratePerMinute !== undefined
            ? data.ratePerMinute * 60
            : data.ratePerHour,
      },
      include: {
        _count: { select: { contracts: true } },
      },
    })

    revalidatePaths(...RATES_PATHS)

    return {
      success: true,
      data: updated,
      message: 'Tipo de tarifa actualizado exitosamente',
    }
  } catch (error) {
    return handleActionError(
      error,
      'updateRateTemplateAction',
      'Error al actualizar tipo de tarifa'
    )
  }
}

export const deleteRateTemplateAction = async (
  id: string
): Promise<ActionResult<null>> => {
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
        error: 'Tipo de tarifa no encontrado',
      }

    if (existing.organizationId !== session.organizationId)
      return {
        success: false,
        error: 'El tipo de tarifa no pertenece a tu organización',
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
      message: 'Tipo de tarifa eliminado exitosamente',
    }
  } catch (error) {
    return handleActionError(
      error,
      'deleteRateTemplateAction',
      'Error al eliminar tipo de tarifa'
    )
  }
}
