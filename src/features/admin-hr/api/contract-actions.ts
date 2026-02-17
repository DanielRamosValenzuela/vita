'use server'

import { requireAdminHROrChiefArea, requireAdminHRWithOrg } from '@/src/shared/lib/auth'
import { ROLES } from '@/src/shared/lib/constants'
import { prisma } from '@/src/shared/lib/db'
import type { ActionResult } from '@/src/shared/lib/types'
import { handleActionError } from '@/src/shared/lib/utils'
import { revalidatePaths } from '@/src/shared/lib/utils/revalidate-paths'

const CONTRACTS_PATHS = ['/dashboard/rates', '/dashboard/staff'] as const

export interface StaffContractSummary {
  id: string
  areaId: string | null
  areaName: string | null
  rateTemplateId: string
  rateTemplateName: string
  customMultiplier: number | null
  startDate: Date
  endDate: Date | null
  isActive: boolean
  notes: string | null
}

export interface StaffWithContract {
  id: string
  name: string
  email: string
  role: string
  primaryAreaId: string | null
  primaryAreaName: string | null
  contracts: StaffContractSummary[]
}

export interface ContractsPageData {
  staff: StaffWithContract[]
  rateTemplates: Array<{
    id: string
    name: string
    description: string | null
    isActive: boolean
    organizationId: string
    createdAt: Date
    updatedAt: Date
    componentsCount: number
    _count: { contracts: number }
    components: Array<{
      id: string
      type: string
      customName: string | null
      value: number
      unit: string
      applyCondition: string
      conditionValue: string | null
      description: string | null
      order: number
      applicableShiftTypes?: Array<{ shiftTypeId: string }>
    }>
  }>
  areas: Array<{ id: string; name: string }>
}

export const getContractsPageDataAction = async (): Promise<ActionResult<ContractsPageData>> => {
  try {
    const session = await requireAdminHRWithOrg()
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
          userAreas: {
            select: {
              area: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { name: 'asc' },
      }),
      prisma.rateTemplate.findMany({
        where: { organizationId: orgId, isActive: true },
        include: {
          _count: {
            select: {
              contracts: true,
              components: true,
            },
          },
          components: {
            orderBy: { order: 'asc' },
            include: {
              applicableShiftTypes: { select: { shiftTypeId: true } },
            },
          },
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
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        area: { select: { id: true, name: true } },
        rateTemplate: { select: { id: true, name: true } },
      },
      orderBy: {
        startDate: 'desc',
      },
    })

    const contractsByUserId = new Map<string, typeof contracts>()

    contracts.forEach((contract) => {
      const existing = contractsByUserId.get(contract.userId)
      if (existing) existing.push(contract)
      else contractsByUserId.set(contract.userId, [contract])
    })

    const contractsCountByRateTemplateId = new Map<string, number>()

    contracts.forEach((contract) => {
      const current = contractsCountByRateTemplateId.get(contract.rateTemplateId) || 0
      contractsCountByRateTemplateId.set(contract.rateTemplateId, current + 1)
    })

    const staff: StaffWithContract[] = users.map((user) => {
      const userContracts = contractsByUserId.get(user.id) || []
      const primaryArea = user.userAreas[0]?.area

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        primaryAreaId: primaryArea?.id ?? null,
        primaryAreaName: primaryArea?.name ?? null,
        contracts: userContracts.map((contract) => ({
          id: contract.id,
          areaId: contract.areaId,
          areaName: contract.area?.name || null,
          rateTemplateId: contract.rateTemplateId,
          rateTemplateName: contract.rateTemplate.name,
          customMultiplier: contract.customMultiplier,
          startDate: contract.startDate,
          endDate: contract.endDate,
          isActive: contract.isActive,
          notes: contract.notes,
        })),
      }
    })

    return {
      success: true,
      data: {
        staff,
        rateTemplates: rateTemplates.map((t) => ({
          id: t.id,
          name: t.name,
          description: t.description,
          isActive: t.isActive,
          organizationId: t.organizationId,
          createdAt: t.createdAt,
          updatedAt: t.updatedAt,
          componentsCount: t._count.components,
          _count: {
            contracts: contractsCountByRateTemplateId.get(t.id) || 0,
          },
          components: t.components,
        })),
        areas,
      },
    }
  } catch (error) {
    return handleActionError(
      error,
      'getContractsPageDataAction',
      'Error al obtener datos de contratos'
    )
  }
}

export const getStaffPageDataAction = async (): Promise<ActionResult<ContractsPageData>> => {
  try {
    const session = await requireAdminHROrChiefArea()

    if (session.role === ROLES.ADMIN_HR) return await getContractsPageDataAction()

    const userAreas = await prisma.userArea.findMany({
      where: { userId: session.id },
      select: { areaId: true },
    })

    const areaIds = userAreas.map((ua) => ua.areaId)

    if (areaIds.length === 0)
      return {
        success: true,
        data: {
          staff: [],
          rateTemplates: [],
          areas: [],
        },
      }

    const users = await prisma.user.findMany({
      where: {
        organizationId: session.organizationId!,
        role: { in: [ROLES.STAFF_HEALTH, ROLES.CHIEF_AREA] },
        userAreas: {
          some: {
            areaId: { in: areaIds },
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        userAreas: {
          select: {
            area: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    })

    const [rateTemplates, areas, contracts] = await Promise.all([
      prisma.rateTemplate.findMany({
        where: {
          organizationId: session.organizationId!,
          isActive: true,
        },
        include: {
          _count: {
            select: {
              contracts: true,
              components: true,
            },
          },
          components: {
            orderBy: { order: 'asc' },
            include: {
              applicableShiftTypes: { select: { shiftTypeId: true } },
            },
          },
        },
        orderBy: { name: 'asc' },
      }),
      prisma.area.findMany({
        where: {
          id: { in: areaIds },
          isActive: true,
        },
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      }),
      prisma.contract.findMany({
        where: {
          organizationId: session.organizationId!,
          userId: {
            in: users.map((u) => u.id),
          },
          isActive: true,
          endDate: null,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          area: { select: { id: true, name: true } },
          rateTemplate: { select: { id: true, name: true } },
        },
      }),
    ])

    const contractsByUserId = new Map<string, typeof contracts>()

    contracts.forEach((contract) => {
      const existing = contractsByUserId.get(contract.userId)
      if (existing) existing.push(contract)
      else contractsByUserId.set(contract.userId, [contract])
    })

    const contractsCountByRateTemplateId = new Map<string, number>()

    contracts.forEach((contract) => {
      const current = contractsCountByRateTemplateId.get(contract.rateTemplateId) || 0
      contractsCountByRateTemplateId.set(contract.rateTemplateId, current + 1)
    })

    const staff: StaffWithContract[] = users.map((user) => {
      const userContracts = contractsByUserId.get(user.id) || []
      const primaryArea = user.userAreas[0]?.area

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        primaryAreaId: primaryArea?.id ?? null,
        primaryAreaName: primaryArea?.name ?? null,
        contracts: userContracts.map((contract) => ({
          id: contract.id,
          areaId: contract.areaId,
          areaName: contract.area?.name || null,
          rateTemplateId: contract.rateTemplateId,
          rateTemplateName: contract.rateTemplate.name,
          customMultiplier: contract.customMultiplier,
          startDate: contract.startDate,
          endDate: contract.endDate,
          isActive: contract.isActive,
          notes: contract.notes,
        })),
      }
    })

    return {
      success: true,
      data: {
        staff,
        rateTemplates: rateTemplates.map((t) => ({
          id: t.id,
          name: t.name,
          description: t.description,
          isActive: t.isActive,
          organizationId: t.organizationId,
          createdAt: t.createdAt,
          updatedAt: t.updatedAt,
          componentsCount: t._count.components,
          _count: {
            contracts: contractsCountByRateTemplateId.get(t.id) || 0,
          },
          components: t.components,
        })),
        areas,
      },
    }
  } catch (error) {
    return handleActionError(error, 'getStaffPageDataAction', 'Error al obtener datos del personal')
  }
}

export const createContractAction = async (data: {
  userId: string
  rateTemplateId: string
  areaId?: string
  customMultiplier?: number
  notes?: string
}): Promise<ActionResult<null>> => {
  try {
    const session = await requireAdminHRWithOrg()

    const user = await prisma.user.findUnique({
      where: { id: data.userId },
    })

    if (!user || user.organizationId !== session.organizationId)
      return {
        success: false,
        error: 'Usuario no encontrado en tu organización',
      }

    const rateTemplate = await prisma.rateTemplate.findFirst({
      where: {
        id: data.rateTemplateId,
        organizationId: session.organizationId,
      },
    })

    if (!rateTemplate)
      return {
        success: false,
        error: 'Tarifa no encontrada',
      }

    const existingSameRate = await prisma.contract.findFirst({
      where: {
        userId: data.userId,
        organizationId: session.organizationId,
        rateTemplateId: data.rateTemplateId,
        isActive: true,
        endDate: null,
      },
    })

    if (existingSameRate)
      return {
        success: false,
        error: 'Esta tarifa ya está asignada a esta persona',
      }

    await prisma.contract.create({
      data: {
        userId: data.userId,
        organizationId: session.organizationId,
        rateTemplateId: data.rateTemplateId,
        areaId: data.areaId || null,
        customMultiplier: data.customMultiplier || null,
        notes: data.notes || null,
      },
    })

    revalidatePaths(...CONTRACTS_PATHS)

    return {
      success: true,
      message: 'Contrato creado exitosamente',
    }
  } catch (error) {
    return handleActionError(error, 'createContractAction', 'Error al crear contrato')
  }
}

export const updateContractAction = async (
  contractId: string,
  data: {
    rateTemplateId?: string
    areaId?: string
    customMultiplier?: number
    notes?: string
  }
): Promise<ActionResult<null>> => {
  try {
    const session = await requireAdminHRWithOrg()

    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
    })

    if (!contract)
      return {
        success: false,
        error: 'Contrato no encontrado',
      }

    if (contract.organizationId !== session.organizationId)
      return {
        success: false,
        error: 'El contrato no pertenece a tu organización',
      }

    await prisma.contract.update({
      where: { id: contractId },
      data: {
        rateTemplateId: data.rateTemplateId,
        areaId: data.areaId !== undefined ? data.areaId : undefined,
        customMultiplier: data.customMultiplier !== undefined ? data.customMultiplier : undefined,
        notes: data.notes !== undefined ? data.notes : undefined,
      },
    })

    revalidatePaths(...CONTRACTS_PATHS)

    return {
      success: true,
      message: 'Contrato actualizado exitosamente',
    }
  } catch (error) {
    return handleActionError(error, 'updateContractAction', 'Error al actualizar contrato')
  }
}

export const endContractAction = async (contractId: string): Promise<ActionResult<null>> => {
  try {
    const session = await requireAdminHRWithOrg()

    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
    })

    if (!contract)
      return {
        success: false,
        error: 'Contrato no encontrado',
      }

    if (contract.organizationId !== session.organizationId)
      return {
        success: false,
        error: 'El contrato no pertenece a tu organización',
      }

    await prisma.contract.update({
      where: { id: contractId },
      data: {
        endDate: new Date(),
        isActive: false,
      },
    })

    revalidatePaths(...CONTRACTS_PATHS)

    return {
      success: true,
      message: 'Contrato finalizado exitosamente',
    }
  } catch (error) {
    return handleActionError(error, 'endContractAction', 'Error al finalizar contrato')
  }
}

export const deleteContractAction = async (contractId: string): Promise<ActionResult<null>> => {
  try {
    const session = await requireAdminHRWithOrg()

    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
    })

    if (!contract)
      return {
        success: false,
        error: 'Contrato no encontrado',
      }

    if (contract.organizationId !== session.organizationId)
      return {
        success: false,
        error: 'El contrato no pertenece a tu organización',
      }

    await prisma.contract.delete({
      where: { id: contractId },
    })

    revalidatePaths(...CONTRACTS_PATHS)

    return {
      success: true,
      message: 'Contrato eliminado exitosamente',
    }
  } catch (error) {
    return handleActionError(error, 'deleteContractAction', 'Error al eliminar contrato')
  }
}
