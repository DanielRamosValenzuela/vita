'use server'

import { prisma } from '@/src/shared/lib/db'
import { requireAdminHRWithOrg, requireAdminHROrChiefArea } from '@/src/shared/lib/auth'
import { ROLES } from '@/src/shared/lib/constants'
import type { ActionResult } from '@/src/shared/lib/types'
import { handleActionError } from '@/src/shared/lib/utils'
import { revalidatePaths } from '@/src/shared/lib/utils/revalidate-paths'

const CONTRACTS_PATHS = ['/dashboard/rates', '/dashboard/staff'] as const

export interface StaffWithContract {
  id: string
  name: string
  email: string
  role: string
  contract: {
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
  } | null
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

export const getContractsPageDataAction = async (): Promise<
  ActionResult<ContractsPageData>
> => {
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
        user: { select: { id: true } },
        area: { select: { id: true, name: true } },
        rateTemplate: { select: { id: true, name: true } },
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

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        contract: {
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
        },
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
          _count: { contracts: t._count.contracts },
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

export const getStaffPageDataAction = async (): Promise<
  ActionResult<ContractsPageData>
> => {
  try {
    const session = await requireAdminHROrChiefArea()

    if (session.role === ROLES.ADMIN_HR)
      return await getContractsPageDataAction()

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

    const [contracts, rateTemplates, areas] = await Promise.all([
      prisma.contract.findMany({
        where: {
          organizationId: session.organizationId!,
          areaId: { in: areaIds },
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
    ])

    const staff: StaffWithContract[] = contracts.map((contract) => ({
      id: contract.user.id,
      name: contract.user.name,
      email: contract.user.email,
      role: contract.user.role,
      contract: {
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
      },
    }))

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
          _count: { contracts: t._count.contracts },
          components: t.components,
        })),
        areas,
      },
    }
  } catch (error) {
    return handleActionError(
      error,
      'getStaffPageDataAction',
      'Error al obtener datos del personal'
    )
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

    const existingContract = await prisma.contract.findFirst({
      where: {
        userId: data.userId,
        organizationId: session.organizationId,
        isActive: true,
        endDate: null,
      },
    })

    if (existingContract)
      return {
        success: false,
        error: 'El usuario ya tiene un contrato activo',
      }

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
    return handleActionError(
      error,
      'createContractAction',
      'Error al crear contrato'
    )
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
    return handleActionError(
      error,
      'updateContractAction',
      'Error al actualizar contrato'
    )
  }
}

export const endContractAction = async (
  contractId: string
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
    return handleActionError(
      error,
      'endContractAction',
      'Error al finalizar contrato'
    )
  }
}
