import type { Prisma, ShiftStatus } from '@prisma/client'

import { prisma } from '@/src/shared/lib/auth/config'

interface GetShiftsParams {
  organizationId: string
  userId?: string
  areaId?: string
  shiftTypeId?: string
  status?: ShiftStatus
  startDate?: Date
  endDate?: Date
  page?: number
  pageSize?: number
}

export const getShifts = async (params: GetShiftsParams) => {
  const {
    organizationId,
    userId,
    areaId,
    shiftTypeId,
    status,
    startDate,
    endDate,
    page = 1,
    pageSize = 50,
  } = params

  const skip = (page - 1) * pageSize

  const where: Prisma.ShiftWhereInput = {
    organizationId,
  }

  if (userId) where.userId = userId
  if (areaId) where.areaId = areaId
  if (shiftTypeId) where.shiftTypeId = shiftTypeId
  if (status) where.status = status

  if (startDate || endDate) {
    where.startTime = {}
    if (startDate) where.startTime.gte = startDate
    if (endDate) where.startTime.lte = endDate
  }

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
    shifts,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

export const getShiftById = async (id: string) => {
  return await prisma.shift.findUnique({
    where: { id },
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
  })
}

interface CreateShiftData {
  title?: string
  startTime: Date
  endTime: Date
  notes?: string
  userId: string
  areaId: string
  shiftTypeId: string
  organizationId: string
}

export const createShift = async (data: CreateShiftData) => {
  return await prisma.shift.create({
    data: {
      ...data,
      status: 'SCHEDULED',
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
        },
      },
    },
  })
}

interface UpdateShiftData {
  title?: string
  startTime?: Date
  endTime?: Date
  status?: ShiftStatus
  notes?: string
  userId?: string
  areaId?: string
  shiftTypeId?: string
}

export const updateShift = async (id: string, data: UpdateShiftData) => {
  return await prisma.shift.update({
    where: { id },
    data,
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
  })
}

export const deleteShift = async (id: string) => {
  return await prisma.shift.delete({
    where: { id },
  })
}

export const getShiftsForCalendar = async (
  organizationId: string,
  startDate: Date,
  endDate: Date
) => {
  return await prisma.shift.findMany({
    where: {
      organizationId,
      startTime: {
        gte: startDate,
        lte: endDate,
      },
      status: {
        in: ['SCHEDULED', 'IN_PROGRESS'],
      },
    },
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
  })
}

export const getUserShiftsForDate = async (userId: string, date: Date) => {
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)

  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  return await prisma.shift.findMany({
    where: {
      userId,
      startTime: {
        gte: startOfDay,
        lte: endOfDay,
      },
      status: {
        in: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED'],
      },
    },
    orderBy: { startTime: 'asc' },
    include: {
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
  })
}
