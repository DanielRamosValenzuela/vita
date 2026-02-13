import type { Prisma } from '@prisma/client'

import { prisma } from '@/src/shared/lib/db'

interface ShiftConflict {
  hasConflict: boolean
  conflictType: 'overlap' | 'double_booking' | 'outside_hours' | 'future_shift'
  conflictingShift?: {
    id: string
    title: string
    startTime: Date
    endTime: Date
    userName: string
    areaName: string
  }
  message: string
}

export async function checkShiftConflicts(
  userId: string,
  areaId: string,
  startTime: Date,
  endTime: Date,
  excludeShiftId?: string
): Promise<ShiftConflict> {
  if (endTime <= startTime)
    return {
      hasConflict: true,
      conflictType: 'outside_hours',
      message: 'La hora de fin debe ser posterior a la hora de inicio',
    }

  const now = new Date()
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
  if (startTime < oneHourAgo)
    return {
      hasConflict: true,
      conflictType: 'future_shift',
      message: 'No se pueden programar turnos en el pasado',
    }

  const shiftDuration = endTime.getTime() - startTime.getTime()
  const maxDuration = 12 * 60 * 60 * 1000
  if (shiftDuration > maxDuration)
    return {
      hasConflict: true,
      conflictType: 'outside_hours',
      message: 'Los turnos no pueden durar más de 12 horas',
    }

  const minDuration = 30 * 60 * 1000
  if (shiftDuration < minDuration)
    return {
      hasConflict: true,
      conflictType: 'outside_hours',
      message: 'Los turnos deben durar al menos 30 minutos',
    }

  const whereClause: Prisma.ShiftWhereInput = {
    userId,
    status: {
      in: ['SCHEDULED', 'IN_PROGRESS'],
    },
    OR: [
      {
        startTime: { lte: startTime },
        endTime: { gt: startTime },
      },

      {
        startTime: { lt: endTime },
        endTime: { gte: endTime },
      },

      {
        startTime: { gte: startTime },
        endTime: { lte: endTime },
      },
    ],
  }

  if (excludeShiftId) whereClause.id = { not: excludeShiftId }

  const conflictingShifts = await prisma.shift.findMany({
    where: whereClause,
    include: {
      area: {
        select: {
          id: true,
          name: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { startTime: 'asc' },
    take: 1,
  })

  if (conflictingShifts.length > 0) {
    const conflict = conflictingShifts[0]
    return {
      hasConflict: true,
      conflictType: 'double_booking',
      conflictingShift: {
        id: conflict.id,
        title: conflict.title || 'Turno sin título',
        startTime: conflict.startTime,
        endTime: conflict.endTime,
        userName: conflict.user.name,
        areaName: conflict.area.name,
      },
      message: `El usuario ya tiene un turno asignado en ese horario: ${conflict.title || 'Turno sin título'} (${formatDateTime(conflict.startTime)} - ${formatDateTime(conflict.endTime)})`,
    }
  }

  return {
    hasConflict: false,
    conflictType: 'overlap',
    message: 'No hay conflictos de horario',
  }
}

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

interface MultipleShiftConflict {
  hasConflict: boolean
  conflicts: Array<{
    userId: string
    userName: string
    conflictingShifts: Array<{
      id: string
      title: string
      startTime: Date
      endTime: Date
    }>
  }>
  message: string
}

export async function checkMultipleUserShiftsConflicts(
  shifts: Array<{
    userId: string
    areaId: string
    startTime: Date
    endTime: Date
    title?: string
  }>
): Promise<MultipleShiftConflict> {
  const conflicts: Array<{
    userId: string
    userName: string
    conflictingShifts: Array<{
      id: string
      title: string
      startTime: Date
      endTime: Date
    }>
  }> = []

  const shiftsByUser = shifts.reduce(
    (acc, shift) => {
      if (!acc[shift.userId]) acc[shift.userId] = []

      acc[shift.userId].push(shift)
      return acc
    },
    {} as Record<string, typeof shifts>
  )

  for (const [userId, userShifts] of Object.entries(shiftsByUser))
    for (let i = 0; i < userShifts.length; i++) {
      const currentShift = userShifts[i]

      const conflictResult = await checkShiftConflicts(
        currentShift.userId,
        currentShift.areaId,
        currentShift.startTime,
        currentShift.endTime
      )

      if (conflictResult.hasConflict) {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { name: true },
        })

        conflicts.push({
          userId,
          userName: user?.name || 'Usuario desconocido',
          conflictingShifts: [
            {
              id: 'existing',
              title: conflictResult.conflictingShift?.title || 'Turno existente',
              startTime: conflictResult.conflictingShift?.startTime || new Date(),
              endTime: conflictResult.conflictingShift?.endTime || new Date(),
            },
          ],
        })
      }

      for (let j = i + 1; j < userShifts.length; j++) {
        const nextShift = userShifts[j]

        if (
          (currentShift.startTime < nextShift.endTime &&
            currentShift.endTime > nextShift.startTime) ||
          (nextShift.startTime < currentShift.endTime && nextShift.endTime > currentShift.startTime)
        ) {
          const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { name: true },
          })

          conflicts.push({
            userId,
            userName: user?.name || 'Usuario desconocido',
            conflictingShifts: [
              {
                id: 'batch-conflict',
                title: nextShift.title || 'Turno en batch',
                startTime: nextShift.startTime,
                endTime: nextShift.endTime,
              },
            ],
          })
        }
      }
    }

  if (conflicts.length > 0)
    return {
      hasConflict: true,
      conflicts,
      message: `Se detectaron conflictos de horario para ${conflicts.length} usuario(s)`,
    }

  return {
    hasConflict: false,
    conflicts: [],
    message: 'No hay conflictos de horario',
  }
}
