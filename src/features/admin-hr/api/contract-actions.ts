'use server'

import { revalidatePath } from 'next/cache'

import { prisma } from '@/src/shared/lib/auth/config'
import { requireAdminHR } from '@/src/shared/lib/auth/session'
import { ROLES } from '@/src/shared/lib/constants'
import type { ActionResult } from '@/src/shared/lib/types'

export interface StaffWithContract {
  id: string
  name: string
  email: string
  role: string
  contract: {
    id: string
    areaId: string | null
    areaName: string | null
    rateTemplateId: string | null
    rateTemplateName: string | null
    ratePerMinute: number | null
    adjustmentPerMinute: number
    effectiveRatePerMinute: number
    baseSalary: number | null
    baseSalaryUnit: string | null
    startDate: Date
    endDate: Date | null
    isActive: boolean
    source: 'template' | 'template_adjusted' | 'custom'
  } | null
}

export interface ContractsPageData {
  staff: StaffWithContract[]
  rateTemplates: Array<{
    id: string
    name: string
    ratePerMinute: number
    baseSalary: number | null
    _count: { contracts: number }
  }>
  areas: Array<{ id: string; name: string }>
}

function getEffectiveRate(
  rateTemplate: { ratePerMinute: number } | null,
  ratePerMinute: number | null,
  adjustmentPerMinute: number
): { effective: number; source: 'template' | 'template_adjusted' | 'custom' } {
  if (ratePerMinute !== null && ratePerMinute !== undefined)
    return { effective: ratePerMinute, source: 'custom' }
  if (rateTemplate) {
    const base = rateTemplate.ratePerMinute
    const effective = base + adjustmentPerMinute
    return {
      effective,
      source: adjustmentPerMinute !== 0 ? 'template_adjusted' : 'template',
    }
  }
  return { effective: 0, source: 'custom' }
}

export const getContractsPageDataAction = async (): Promise<
  ActionResult<ContractsPageData>
> => {
  try {
    const session = await requireAdminHR()
    if (!session.organizationId)
      return {
        success: false,
        error: 'No tienes una organización asignada',
      }

    const orgId = session.organizationId

    const [users, rateTemplates, areas] = await Promise.all([
      prisma.user.findMany({
        where: {
          organizationId: orgId,
          role: { in: [ROLES.STAFF_HEALTH, ROLES.CHIEF_AREA] },
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
        orderBy: { name: 'asc' },
      }),
      prisma.rateTemplate.findMany({
        where: { organizationId: orgId, isActive: true },
        select: {
          id: true,
          name: true,
          ratePerMinute: true,
          baseSalary: true,
          _count: { select: { contracts: true } },
        },
        orderBy: { name: 'asc' },
      }),
      prisma.area.findMany({
        where: { organizationId: orgId, isActive: true },
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      }),
    ])

    const contracts = await prisma.contract.findMany({
      where: {
        organizationId: orgId,
        isActive: true,
        endDate: null,
      },
      include: {
        user: { select: { id: true } },
        area: { select: { id: true, name: true } },
        rateTemplate: { select: { id: true, name: true, ratePerMinute: true } },
      },
    })

    const contractByUserId = new Map(
      contracts.map((c) => [c.userId, c])
    )

    const staff: StaffWithContract[] = users.map((user) => {
      const contract = contractByUserId.get(user.id)
      if (!contract)
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          contract: null,
        }

      const { effective, source } = getEffectiveRate(
        contract.rateTemplate,
        contract.ratePerMinute,
        contract.adjustmentPerMinute
      )

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        contract: {
          id: contract.id,
          areaId: contract.areaId,
          areaName: contract.area?.name ?? null,
          rateTemplateId: contract.rateTemplateId,
          rateTemplateName: contract.rateTemplate?.name ?? null,
          ratePerMinute: contract.ratePerMinute,
          adjustmentPerMinute: contract.adjustmentPerMinute,
          effectiveRatePerMinute: effective,
          baseSalary: contract.baseSalary,
          baseSalaryUnit: contract.baseSalaryUnit,
          startDate: contract.startDate,
          endDate: contract.endDate,
          isActive: contract.isActive,
          source,
        },
      }
    })

    return {
      success: true,
      data: {
        staff,
        rateTemplates,
        areas,
      },
    }
  } catch (error) {
    console.error('[getContractsPageDataAction] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al cargar contratos',
    }
  }
}

export const createContractAction = async (data: {
  userId: string
  areaId?: string
  rateTemplateId?: string
  ratePerMinute?: number
  adjustmentPerMinute?: number
  baseSalary?: number
  baseSalaryUnit?: 'MONTHLY' | 'DAILY' | 'HOURLY'
}): Promise<ActionResult<{ id: string }>> => {
  try {
    const session = await requireAdminHR()
    if (!session.organizationId)
      return {
        success: false,
        error: 'No tienes una organización asignada',
      }

    const orgId = session.organizationId

    const hasRateTemplate = !!data.rateTemplateId
    const hasCustomRate = data.ratePerMinute !== undefined && data.ratePerMinute !== null

    if (!hasRateTemplate && !hasCustomRate)
      return {
        success: false,
        error: 'Debes asignar un tipo de tarifa o una tarifa personalizada',
      }

    if (hasCustomRate && data.ratePerMinute! < 0)
      return {
        success: false,
        error: 'La tarifa no puede ser negativa',
      }

    const user = await prisma.user.findUnique({
      where: { id: data.userId },
      select: { organizationId: true },
    })

    if (!user || user.organizationId !== orgId)
      return {
        success: false,
        error: 'El usuario no pertenece a tu organización',
      }

    const existingActive = await prisma.contract.findFirst({
      where: {
        userId: data.userId,
        organizationId: orgId,
        isActive: true,
        endDate: null,
      },
    })

    if (existingActive)
      return {
        success: false,
        error: 'Este personal ya tiene un contrato activo',
      }

    if (data.areaId) {
      const area = await prisma.area.findUnique({
        where: { id: data.areaId },
      })
      if (!area || area.organizationId !== orgId)
        return {
          success: false,
          error: 'El área no pertenece a tu organización',
        }
    }

    if (data.rateTemplateId) {
      const rt = await prisma.rateTemplate.findUnique({
        where: { id: data.rateTemplateId },
      })
      if (!rt || rt.organizationId !== orgId)
        return {
          success: false,
          error: 'El tipo de tarifa no pertenece a tu organización',
        }
    }

    const contract = await prisma.contract.create({
      data: {
        userId: data.userId,
        organizationId: orgId,
        areaId: data.areaId || null,
        rateTemplateId: data.rateTemplateId || null,
        ratePerMinute: data.ratePerMinute ?? null,
        adjustmentPerMinute: data.adjustmentPerMinute ?? 0,
        baseSalary: data.baseSalary ?? null,
        baseSalaryUnit: data.baseSalaryUnit ?? null,
      },
      select: { id: true },
    })

    revalidatePath('/dashboard/rates')

    return {
      success: true,
      data: { id: contract.id },
      message: 'Contrato creado exitosamente',
    }
  } catch (error) {
    console.error('[createContractAction] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al crear contrato',
    }
  }
}

export const updateContractAction = async (
  id: string,
  data: {
    areaId?: string | null
    rateTemplateId?: string | null
    ratePerMinute?: number | null
    adjustmentPerMinute?: number
    baseSalary?: number | null
    baseSalaryUnit?: 'MONTHLY' | 'DAILY' | 'HOURLY' | null
  }
): Promise<ActionResult<null>> => {
  try {
    const session = await requireAdminHR()
    if (!session.organizationId)
      return {
        success: false,
        error: 'No tienes una organización asignada',
      }

    const existing = await prisma.contract.findUnique({
      where: { id },
    })

    if (!existing)
      return {
        success: false,
        error: 'Contrato no encontrado',
      }

    if (existing.organizationId !== session.organizationId)
      return {
        success: false,
        error: 'El contrato no pertenece a tu organización',
      }

    const ratePerMinute = data.ratePerMinute

    if (ratePerMinute !== undefined && ratePerMinute !== null && ratePerMinute < 0)
      return {
        success: false,
        error: 'La tarifa no puede ser negativa',
      }

    await prisma.contract.update({
      where: { id },
      data: {
        areaId: data.areaId ?? undefined,
        rateTemplateId: data.rateTemplateId ?? undefined,
        ratePerMinute: data.ratePerMinute ?? undefined,
        adjustmentPerMinute: data.adjustmentPerMinute ?? undefined,
        baseSalary: data.baseSalary ?? undefined,
        baseSalaryUnit:
          data.baseSalaryUnit != null
            ? (data.baseSalaryUnit as 'MONTHLY' | 'DAILY' | 'HOURLY')
            : undefined,
      },
    })

    revalidatePath('/dashboard/rates')

    return {
      success: true,
      message: 'Contrato actualizado exitosamente',
    }
  } catch (error) {
    console.error('[updateContractAction] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al actualizar contrato',
    }
  }
}

export const endContractAction = async (id: string): Promise<ActionResult<null>> => {
  try {
    const session = await requireAdminHR()
    if (!session.organizationId)
      return {
        success: false,
        error: 'No tienes una organización asignada',
      }

    const existing = await prisma.contract.findUnique({
      where: { id },
    })

    if (!existing)
      return {
        success: false,
        error: 'Contrato no encontrado',
      }

    if (existing.organizationId !== session.organizationId)
      return {
        success: false,
        error: 'El contrato no pertenece a tu organización',
      }

    await prisma.contract.update({
      where: { id },
      data: {
        endDate: new Date(),
        isActive: false,
      },
    })

    revalidatePath('/dashboard/rates')

    return {
      success: true,
      message: 'Contrato finalizado exitosamente',
    }
  } catch (error) {
    console.error('[endContractAction] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al finalizar contrato',
    }
  }
}

export const deleteContractAction = async (id: string): Promise<ActionResult<null>> => {
  try {
    const session = await requireAdminHR()
    if (!session.organizationId)
      return {
        success: false,
        error: 'No tienes una organización asignada',
      }

    const existing = await prisma.contract.findUnique({
      where: { id },
      include: {
        _count: { select: { shifts: true } },
      },
    })

    if (!existing)
      return {
        success: false,
        error: 'Contrato no encontrado',
      }

    if (existing.organizationId !== session.organizationId)
      return {
        success: false,
        error: 'El contrato no pertenece a tu organización',
      }

    if (existing._count.shifts > 0)
      return {
        success: false,
        error: 'No se puede eliminar: tiene turnos asociados',
      }

    await prisma.contract.delete({
      where: { id },
    })

    revalidatePath('/dashboard/rates')

    return {
      success: true,
      message: 'Contrato eliminado exitosamente',
    }
  } catch (error) {
    console.error('[deleteContractAction] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al eliminar contrato',
    }
  }
}
