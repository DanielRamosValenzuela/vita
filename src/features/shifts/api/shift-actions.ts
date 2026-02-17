'use server'

import { revalidatePath } from 'next/cache'
import type { Prisma } from '@prisma/client'
import { format } from 'date-fns'
import { getTranslations } from 'next-intl/server'
import { z } from 'zod'

import { isChiefArea } from '@/src/shared/lib/auth/rbac'
import { requireAdminHROrChiefArea } from '@/src/shared/lib/auth/session'
import { prisma } from '@/src/shared/lib/db'
import type { ActionResult } from '@/src/shared/lib/types'

import { checkShiftConflicts } from '@/src/entities/shift'

import { createNotification } from '@/src/features/notifications/lib/notification-service'

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

const updateShiftSchema = z.object({
  title: z.string().optional(),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).optional(),
  userId: z.string().optional(),
  areaId: z.string().optional(),
  shiftTypeId: z.string().optional(),
  startTime: z.date().optional(),
  endTime: z.date().optional(),
  notes: z.string().optional(),
})

export const createShiftAction = async (
  data: z.infer<typeof createShiftSchema>
): Promise<ActionResult<ShiftWithRelations>> => {
  try {
    const session = await requireAdminHROrChiefArea()
    if (!session.organizationId)
      return {
        success: false,
        error: 'No tienes una organización asignada',
      }

    const validatedData = createShiftSchema.parse(data)

    if (isChiefArea(session)) {
      const chiefArea = await prisma.userArea.findFirst({
        where: { userId: session.id, areaId: validatedData.areaId },
      })
      if (!chiefArea)
        return {
          success: false,
          error: 'Solo puedes crear turnos en las áreas que tienes asignadas',
        }
    }

    const user = await prisma.user.findUnique({
      where: { id: validatedData.userId },
      select: { organizationId: true },
    })

    if (!user || user.organizationId !== session.organizationId!)
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
        organizationId: session.organizationId!,
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
        organizationId: session.organizationId!,
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
        organizationId: session.organizationId!,
        isActive: true,
        OR: [{ areaId: validatedData.areaId }, { areaId: null }],
      },
      orderBy: [{ areaId: 'desc' }, { startDate: 'desc' }],
    })

    const shift = await prisma.shift.create({
      data: {
        ...validatedData,
        organizationId: session.organizationId!,
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
        organizationId: session.organizationId!,
        type: 'SHIFT_CREATED',
        title: tNotif('types.SHIFT_CREATED', { actor: session.name, date: format(shift.startTime, 'dd/MM/yyyy') }),
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

export const updateShiftAction = async (
  id: string,
  data: z.infer<typeof updateShiftSchema>
): Promise<ActionResult<ShiftWithRelations>> => {
  try {
    const session = await requireAdminHROrChiefArea()
    if (!session.organizationId)
      return {
        success: false,
        error: 'No tienes una organización asignada',
      }

    const validatedData = updateShiftSchema.parse(data)

    const existingShift = await prisma.shift.findUnique({
      where: { id },
      select: {
        id: true,
        organizationId: true,
        areaId: true,
        userId: true,
        startTime: true,
        endTime: true,
        shiftTypeId: true,
      },
    })

    if (!existingShift)
      return {
        success: false,
        error: 'Turno no encontrado',
      }

    if (existingShift.organizationId !== session.organizationId)
      return {
        success: false,
        error: 'El turno no pertenece a tu organización',
      }

    if (isChiefArea(session)) {
      const chiefArea = await prisma.userArea.findFirst({
        where: { userId: session.id, areaId: existingShift.areaId },
      })
      if (!chiefArea)
        return {
          success: false,
          error: 'Solo puedes editar turnos de tus áreas',
        }
    }

    if (validatedData.startTime || validatedData.endTime) {
      const startTime = validatedData.startTime || existingShift.startTime
      const endTime = validatedData.endTime || existingShift.endTime
      const userId = validatedData.userId || existingShift.userId
      const areaId = validatedData.areaId || existingShift.areaId

      const conflictCheck = await checkShiftConflicts(userId, areaId, startTime, endTime, id)

      if (conflictCheck.hasConflict)
        return {
          success: false,
          error: conflictCheck.message,
        }
    }

    const areaId = validatedData.areaId ?? existingShift.areaId
    const shiftTypeId = validatedData.shiftTypeId ?? existingShift.shiftTypeId

    if (areaId && shiftTypeId) {
      const shiftType = await prisma.shiftType.findFirst({
        where: { id: shiftTypeId, organizationId: session.organizationId! },
      })
      if (shiftType && !shiftType.isGlobal) {
        const areaShiftType = await prisma.areaShiftType.findUnique({
          where: {
            areaId_shiftTypeId: { areaId, shiftTypeId },
          },
        })
        if (!areaShiftType)
          return {
            success: false,
            error: 'El tipo de turno no está asignado a esta área',
          }
      }
    }

    const updatedShift = await prisma.shift.update({
      where: { id },
      data: validatedData,
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

    if (updatedShift.userId !== session.id) {
      const tNotif = await getTranslations('notifications')
      await createNotification({
        userId: updatedShift.userId,
        actorId: session.id,
        organizationId: session.organizationId!,
        type: 'SHIFT_UPDATED',
        title: tNotif('types.SHIFT_UPDATED', { actor: session.name, date: format(updatedShift.startTime, 'dd/MM/yyyy') }),
        actionUrl: '/dashboard/shifts',
      })
    }

    revalidatePath('/dashboard/shifts')
    revalidatePath('/dashboard/shifts/calendar')
    revalidatePath(`/dashboard/shifts/${id}`)

    return {
      success: true,
      data: updatedShift,
      message: 'Turno actualizado exitosamente',
    }
  } catch (error) {
    console.error('[updateShiftAction] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al actualizar turno',
    }
  }
}

export const deleteShiftAction = async (id: string): Promise<ActionResult<null>> => {
  try {
    const session = await requireAdminHROrChiefArea()
    if (!session.organizationId)
      return {
        success: false,
        error: 'No tienes una organización asignada',
      }

    const shift = await prisma.shift.findUnique({
      where: { id },
      select: { id: true, organizationId: true, areaId: true, userId: true, startTime: true },
    })

    if (!shift)
      return {
        success: false,
        error: 'Turno no encontrado',
      }

    if (shift.organizationId !== session.organizationId)
      return {
        success: false,
        error: 'El turno no pertenece a tu organización',
      }

    if (isChiefArea(session)) {
      const chiefArea = await prisma.userArea.findFirst({
        where: { userId: session.id, areaId: shift.areaId },
      })
      if (!chiefArea)
        return {
          success: false,
          error: 'Solo puedes cancelar turnos de tus áreas',
        }
    }

    await prisma.shift.update({
      where: { id },
      data: { status: 'CANCELLED' },
    })

    if (shift.userId !== session.id) {
      const tNotif = await getTranslations('notifications')
      await createNotification({
        userId: shift.userId,
        actorId: session.id,
        organizationId: session.organizationId!,
        type: 'SHIFT_CANCELLED',
        title: tNotif('types.SHIFT_CANCELLED', { actor: session.name, date: format(shift.startTime, 'dd/MM/yyyy') }),
        actionUrl: '/dashboard/shifts',
      })
    }

    revalidatePath('/dashboard/shifts')
    revalidatePath('/dashboard/shifts/calendar')
    revalidatePath(`/dashboard/shifts/${id}`)

    return {
      success: true,
      message: 'Turno cancelado exitosamente',
    }
  } catch (error) {
    console.error('[deleteShiftAction] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al cancelar turno',
    }
  }
}

export const getShiftsAction = async (
  params: GetShiftsParams
): Promise<ActionResult<GetShiftsResult>> => {
  try {
    const session = await requireAdminHROrChiefArea()

    const userAreas = await prisma.userArea.findMany({
      where: { userId: session.id },
      select: { areaId: true, area: { select: { organizationId: true } } },
    })
    const chiefAreaIds = userAreas.map((a) => a.areaId)
    const hasAreaAssignment = chiefAreaIds.length > 0

    let organizationId: string | null = session.organizationId ?? null
    if (hasAreaAssignment && !organizationId)
      organizationId = userAreas[0]?.area?.organizationId ?? null

    if (!organizationId)
      return {
        success: false,
        error: 'No tienes una organización asignada',
      }

    const effectiveOrgId = organizationId as string

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

    if (isChiefArea(session) && !hasAreaAssignment)
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

    if (hasAreaAssignment) where.areaId = { in: chiefAreaIds }

    if (status) where.status = status
    if (userId) where.userId = userId
    if (areaId && (!hasAreaAssignment || chiefAreaIds.includes(areaId))) where.areaId = areaId
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
