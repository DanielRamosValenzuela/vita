'use server'

import { getTranslations } from 'next-intl/server'
import { revalidatePath } from 'next/cache'
import type { Prisma } from '@prisma/client'
import { format } from 'date-fns'
import { z } from 'zod'

import { chiefHasAreaAccess, getChiefAccessibleAreaIds, resolveChiefOrganizationId } from '@/src/shared/lib/auth/chief-access'
import { isChiefArea } from '@/src/shared/lib/auth/rbac'
import { requireAdminHROrChief } from '@/src/shared/lib/auth/session'
import { prisma } from '@/src/shared/lib/db'
import { calculateShiftPayment } from '@/src/shared/lib/payment/calculate-shift-payment'
import type { ActionResult } from '@/src/shared/lib/types'
import { createNotification } from '@/src/features/notifications/lib/notification-service'

import { checkShiftConflicts } from '@/src/entities/shift'

import type { GetShiftsParams, GetShiftsResult, ShiftWithRelations } from '../types/shift-types'

const createShiftSchema = z.object({
  title: z.string().optional(),
  userId: z.string().min(1, 'ID de usuario requerido'),
  areaId: z.string().min(1, 'ID de área requerido'),
  shiftTypeId: z.string().min(1, 'ID de tipo de turno requerido'),
  startTime: z.date(),
  endTime: z.date(),
  notes: z.string().optional(),
})

export const createShiftAction = async (
  data: z.infer<typeof createShiftSchema>
): Promise<ActionResult<ShiftWithRelations>> => {
  try {
    const session = await requireAdminHROrChief()

    const derivedOrgId = isChiefArea(session)
      ? await resolveChiefOrganizationId(session.id, session.organizationId ?? null)
      : session.organizationId ?? null
    if (!derivedOrgId)
      return {
        success: false,
        error: 'No tienes una organización asignada',
      }
    const organizationId = derivedOrgId

    const validatedData = createShiftSchema.parse(data)

    if (isChiefArea(session)) {
      const hasAccess = await chiefHasAreaAccess(session.id, validatedData.areaId)
      if (!hasAccess)
        return {
          success: false,
          error: 'Solo puedes crear turnos en las áreas que tienes asignadas',
        }
    }

    const user = await prisma.user.findUnique({
      where: { id: validatedData.userId },
      select: { organizationId: true },
    })

    if (!user || user.organizationId !== organizationId)
      return {
        success: false,
        error: 'El usuario no pertenece a tu organización',
      }

    const conflictCheck = await checkShiftConflicts(
      validatedData.userId,
      validatedData.areaId,
      validatedData.startTime,
      validatedData.endTime
    )

    if (conflictCheck.hasConflict)
      return {
        success: false,
        error: conflictCheck.message,
      }

    const area = await prisma.area.findUnique({
      where: {
        id: validatedData.areaId,
        organizationId,
      },
    })

    if (!area)
      return {
        success: false,
        error: 'El área no pertenece a tu organización',
      }

    const shiftType = await prisma.shiftType.findUnique({
      where: {
        id: validatedData.shiftTypeId,
        organizationId,
      },
    })

    if (!shiftType)
      return {
        success: false,
        error: 'El tipo de turno no pertenece a tu organización',
      }

    if (!shiftType.isGlobal) {
      const areaShiftType = await prisma.areaShiftType.findUnique({
        where: {
          areaId_shiftTypeId: {
            areaId: validatedData.areaId,
            shiftTypeId: validatedData.shiftTypeId,
          },
        },
      })
      if (!areaShiftType)
        return {
          success: false,
          error: 'El tipo de turno no está asignado a esta área',
        }
    }

    const activeContract = await prisma.contract.findFirst({
      where: {
        userId: validatedData.userId,
        organizationId,
        isActive: true,
        OR: [{ areaId: validatedData.areaId }, { areaId: null }],
      },
      orderBy: [{ areaId: 'desc' }, { startDate: 'desc' }],
    })

    const shift = await prisma.shift.create({
      data: {
        ...validatedData,
        organizationId,
        status: 'SCHEDULED',
        contractId: activeContract?.id ?? undefined,
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
        area: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        shiftType: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
          },
        },
      },
    })

    if (shift.userId !== session.id) {
      const tNotif = await getTranslations('notifications')
      await createNotification({
        userId: shift.userId,
        actorId: session.id,
        organizationId,
        type: 'SHIFT_CREATED',
        title: tNotif('types.SHIFT_CREATED', {
          actor: session.name,
          date: format(shift.startTime, 'dd/MM/yyyy'),
        }),
        description: `${shift.area.name} — ${shift.shiftType.name}`,
        actionUrl: '/dashboard/shifts',
      })
    }

    revalidatePath('/dashboard/shifts')
    revalidatePath('/dashboard/shifts/calendar')

    return {
      success: true,
      data: shift,
      message: 'Turno creado exitosamente',
    }
  } catch (error) {
    console.error('[createShiftAction] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al crear turno',
    }
  }
}

const updateShiftSchema = createShiftSchema

export const updateShiftAction = async (
  shiftId: string,
  data: z.infer<typeof updateShiftSchema>
): Promise<ActionResult<ShiftWithRelations>> => {
  try {
    const session = await requireAdminHROrChief()

    const derivedOrgId = isChiefArea(session)
      ? await resolveChiefOrganizationId(session.id, session.organizationId ?? null)
      : session.organizationId ?? null
    if (!derivedOrgId)
      return { success: false, error: 'No tienes una organización asignada' }
    const organizationId = derivedOrgId

    const existing = await prisma.shift.findFirst({
      where: { id: shiftId, organizationId },
      include: { user: true, area: true, shiftType: true },
    })
    if (!existing)
      return { success: false, error: 'Turno no encontrado' }

    if (isChiefArea(session)) {
      const hasAccess = await chiefHasAreaAccess(session.id, existing.areaId)
      if (!hasAccess)
        return {
          success: false,
          error: 'Solo puedes editar turnos de las áreas que tienes asignadas',
        }
    }

    const validatedData = updateShiftSchema.parse(data)

    if (isChiefArea(session)) {
      const hasNewAccess = await chiefHasAreaAccess(session.id, validatedData.areaId)
      if (!hasNewAccess)
        return {
          success: false,
          error: 'Solo puedes asignar turnos en las áreas que tienes asignadas',
        }
    }

    const user = await prisma.user.findUnique({
      where: { id: validatedData.userId },
      select: { organizationId: true },
    })
    if (!user || user.organizationId !== organizationId)
      return { success: false, error: 'El usuario no pertenece a tu organización' }

    const conflictCheck = await checkShiftConflicts(
      validatedData.userId,
      validatedData.areaId,
      validatedData.startTime,
      validatedData.endTime,
      shiftId
    )
    if (conflictCheck.hasConflict)
      return { success: false, error: conflictCheck.message }

    const area = await prisma.area.findUnique({
      where: { id: validatedData.areaId, organizationId },
    })
    if (!area)
      return { success: false, error: 'El área no pertenece a tu organización' }

    const shiftType = await prisma.shiftType.findUnique({
      where: { id: validatedData.shiftTypeId, organizationId },
    })
    if (!shiftType)
      return { success: false, error: 'El tipo de turno no pertenece a tu organización' }

    if (!shiftType.isGlobal) {
      const areaShiftType = await prisma.areaShiftType.findUnique({
        where: {
          areaId_shiftTypeId: {
            areaId: validatedData.areaId,
            shiftTypeId: validatedData.shiftTypeId,
          },
        },
      })
      if (!areaShiftType)
        return {
          success: false,
          error: 'El tipo de turno no está asignado a esta área',
        }
    }

    const activeContract = await prisma.contract.findFirst({
      where: {
        userId: validatedData.userId,
        organizationId,
        isActive: true,
        OR: [{ areaId: validatedData.areaId }, { areaId: null }],
      },
      orderBy: [{ areaId: 'desc' }, { startDate: 'desc' }],
    })

    const shift = await prisma.shift.update({
      where: { id: shiftId },
      data: {
        title: validatedData.title ?? null,
        userId: validatedData.userId,
        areaId: validatedData.areaId,
        shiftTypeId: validatedData.shiftTypeId,
        startTime: validatedData.startTime,
        endTime: validatedData.endTime,
        notes: validatedData.notes ?? null,
        contractId: activeContract?.id ?? undefined,
        ...(existing.rotationId ? { isManuallyModified: true } : {}),
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
        area: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        shiftType: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
          },
        },
      },
    })

    revalidatePath('/dashboard/shifts')
    revalidatePath('/dashboard/shifts/calendar')
    return {
      success: true,
      data: shift,
      message: 'Turno actualizado',
    }
  } catch (error) {
    console.error('[updateShiftAction] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al actualizar turno',
    }
  }
}

const completeShiftSchema = z.object({
  actualStartTime: z.date().optional(),
  actualEndTime: z.date(),
  notes: z.string().optional(),
})

export const completeShiftAction = async (
  shiftId: string,
  data: z.infer<typeof completeShiftSchema>
): Promise<ActionResult<{ shiftId: string; paymentId?: string; finalAmount?: number }>> => {
  try {
    const session = await requireAdminHROrChief()

    const derivedOrgId = isChiefArea(session)
      ? await resolveChiefOrganizationId(session.id, session.organizationId ?? null)
      : session.organizationId ?? null
    if (!derivedOrgId)
      return { success: false, error: 'No tienes una organización asignada' }
    const organizationId = derivedOrgId

    const existing = await prisma.shift.findFirst({
      where: { id: shiftId, organizationId },
      include: { payment: true },
    })
    if (!existing)
      return { success: false, error: 'Turno no encontrado' }

    if (existing.status === 'COMPLETED')
      return { success: false, error: 'El turno ya está completado' }

    if (isChiefArea(session)) {
      const hasAccess = await chiefHasAreaAccess(session.id, existing.areaId)
      if (!hasAccess)
        return {
          success: false,
          error: 'Solo puedes completar turnos de las áreas que tienes asignadas',
        }
    }

    const validatedData = completeShiftSchema.parse(data)

    
    await prisma.shift.update({
      where: { id: shiftId },
      data: {
        status: 'COMPLETED',
        actualStartTime: validatedData.actualStartTime ?? existing.startTime,
        actualEndTime: validatedData.actualEndTime,
        notes: validatedData.notes ?? existing.notes,
      },
    })

    
    let paymentId: string | undefined
    let finalAmount: number | undefined

    if (existing.contractId && !existing.payment) 
      try {
        const paymentResult = await calculateShiftPayment(shiftId)
        paymentId = paymentResult.paymentId
        finalAmount = paymentResult.finalAmount
      } catch (paymentError) {
        console.error('[completeShiftAction] Payment calculation failed:', paymentError)
        
      }
    

    revalidatePath('/dashboard/shifts')
    revalidatePath('/dashboard/shifts/calendar')

    return {
      success: true,
      data: { shiftId, paymentId, finalAmount },
      message: 'Turno completado',
    }
  } catch (error) {
    console.error('[completeShiftAction] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al completar turno',
    }
  }
}

export const deleteShiftAction = async (
  shiftId: string
): Promise<ActionResult<null>> => {
  try {
    const session = await requireAdminHROrChief()

    const derivedOrgId = isChiefArea(session)
      ? await resolveChiefOrganizationId(session.id, session.organizationId ?? null)
      : session.organizationId ?? null
    if (!derivedOrgId)
      return { success: false, error: 'No tienes una organización asignada' }

    const existing = await prisma.shift.findFirst({
      where: { id: shiftId, organizationId: derivedOrgId },
    })
    if (!existing)
      return { success: false, error: 'Turno no encontrado' }

    if (isChiefArea(session)) {
      const hasAccess = await chiefHasAreaAccess(session.id, existing.areaId)
      if (!hasAccess)
        return {
          success: false,
          error: 'Solo puedes eliminar turnos de las áreas que tienes asignadas',
        }
    }

    await prisma.shift.delete({ where: { id: shiftId } })

    revalidatePath('/dashboard/shifts')
    revalidatePath('/dashboard/shifts/calendar')
    return { success: true, data: null, message: 'Turno eliminado' }
  } catch (error) {
    console.error('[deleteShiftAction] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al eliminar turno',
    }
  }
}

export const getShiftsAction = async (
  params: GetShiftsParams
): Promise<ActionResult<GetShiftsResult>> => {
  try {
    const session = await requireAdminHROrChief()

    const organizationId = isChiefArea(session)
      ? await resolveChiefOrganizationId(session.id, session.organizationId ?? null)
      : session.organizationId ?? null

    if (!organizationId)
      return {
        success: false,
        error: 'No tienes una organización asignada',
      }

    const effectiveOrgId = organizationId

    let chiefAreaIds: string[] | null = null
    if (isChiefArea(session)) {
      chiefAreaIds = await getChiefAccessibleAreaIds(session.id)
      if (chiefAreaIds.length === 0)
        return {
          success: true,
          data: {
            shifts: [],
            total: 0,
            page: 1,
            pageSize: params.pageSize ?? 20,
            totalPages: 0,
          },
        }
    }

    const {
      page = 1,
      pageSize = 20,
      status,
      userId,
      areaId,
      shiftTypeId,
      search,
      startDate,
      endDate,
    } = params

    const where: Prisma.ShiftWhereInput = {
      organizationId: effectiveOrgId,
    }

    if (chiefAreaIds) where.areaId = { in: chiefAreaIds }

    if (status) where.status = status
    if (userId) where.userId = userId
    if (areaId && (!chiefAreaIds || chiefAreaIds.includes(areaId))) where.areaId = areaId
    if (shiftTypeId) where.shiftTypeId = shiftTypeId

    if (search)
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { area: { name: { contains: search, mode: 'insensitive' } } },
      ]

    if (startDate || endDate) {
      where.startTime = {}
      if (startDate) where.startTime.gte = startDate
      if (endDate) where.startTime.lte = endDate
    }

    const skip = (page - 1) * pageSize

    const [shifts, total] = await Promise.all([
      prisma.shift.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { startTime: 'asc' },
        select: {
          id: true,
          title: true,
          userId: true,
          areaId: true,
          shiftTypeId: true,
          organizationId: true,
          contractId: true,
          rotationId: true,
          rotationGroupId: true,
          isManuallyModified: true,
          isExtra: true,
          coverageStatus: true,
          startTime: true,
          endTime: true,
          actualStartTime: true,
          actualEndTime: true,
          status: true,
          notes: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          area: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
          shiftType: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
          rotation: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.shift.count({ where }),
    ])

    return {
      success: true,
      data: {
        shifts,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    }
  } catch (error) {
    console.error('[getShiftsAction] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener turnos',
    }
  }
}
