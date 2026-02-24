'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { isChiefArea } from '@/src/shared/lib/auth/rbac'
import { requireAdminHROrChiefArea } from '@/src/shared/lib/auth/session'
import { prisma } from '@/src/shared/lib/db'
import type { ActionResult } from '@/src/shared/lib/types'

import {
  calculateCoverage,
  calculateEndTime,
  combineDateAndTime,
  daysBetween,
  getStepForDay,
} from '@/src/entities/rotation'

import { createNotification } from '@/src/features/notifications/lib/notification-service'

import { generateShiftsSchema, previewGenerationSchema, regenerateShiftsSchema } from '../lib/rotation-schemas'
import type {
  CoverageAlert,
  CoverageDay,
  CoverageOverview,
  GenerationPreview,
  GenerationResult,
  ShiftConflict,
} from '../types/rotation-types'

export const previewGenerationAction = async (
  data: z.infer<typeof previewGenerationSchema>
): Promise<ActionResult<GenerationPreview>> => {
  try {
    const session = await requireAdminHROrChiefArea()

    let derivedOrgId: string | null = session.organizationId ?? null
    if (isChiefArea(session) && !derivedOrgId) {
      const firstArea = await prisma.userArea.findFirst({
        where: { userId: session.id },
        select: { area: { select: { organizationId: true } } },
      })
      derivedOrgId = firstArea?.area?.organizationId ?? null
    }
    if (!derivedOrgId)
      return { success: false, error: 'No tienes una organización asignada' }
    const organizationId = derivedOrgId

    const validatedData = previewGenerationSchema.parse(data)

    const rotation = await prisma.rotation.findFirst({
      where: { id: validatedData.rotationId, organizationId },
      select: {
        id: true,
        areaId: true,
        startDate: true,
        steps: {
          orderBy: { order: 'asc' as const },
          select: {
            id: true,
            order: true,
            isRestDay: true,
            shiftTypeId: true,
            shiftType: {
              select: {
                id: true,
                name: true,
                durationMinutes: true,
              },
            },
          },
        },
        shiftConfigs: {
          select: {
            shiftTypeId: true,
            startTime: true,
          },
        },
        groups: {
          select: {
            id: true,
            name: true,
            cycleOffset: true,
            members: {
              where: { leftAt: null },
              select: {
                userId: true,
                user: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!rotation)
      return { success: false, error: 'Rotativa no encontrada' }

    if (isChiefArea(session)) {
      const chiefArea = await prisma.userArea.findFirst({
        where: { userId: session.id, areaId: rotation.areaId },
      })
      if (!chiefArea)
        return { success: false, error: 'Solo puedes gestionar rotativas en las áreas que tienes asignadas' }
    }

    const patternLength = rotation.steps.length
    if (patternLength === 0)
      return { success: false, error: 'La rotativa no tiene pasos definidos' }

    const configMap = new Map<string, string>()
    for (const cfg of rotation.shiftConfigs)
      configMap.set(cfg.shiftTypeId, cfg.startTime)

    const effectiveOrigin = rotation.startDate ?? validatedData.startDate
    const daysInRange = daysBetween(validatedData.startDate, validatedData.endDate) + 1

    const conflicts: ShiftConflict[] = []
    const shiftsPerGroupMap = new Map<string, number>()

    for (const group of rotation.groups)
      shiftsPerGroupMap.set(group.id, 0)

    for (let d = 0; d < daysInRange; d++) {
      const currentDate = new Date(
        Date.UTC(
          validatedData.startDate.getUTCFullYear(),
          validatedData.startDate.getUTCMonth(),
          validatedData.startDate.getUTCDate() + d,
        )
      )

      const dayIndex = daysBetween(effectiveOrigin, currentDate)

      for (const group of rotation.groups) {
        const stepIndex = getStepForDay(patternLength, group.cycleOffset, dayIndex)
        const step = rotation.steps[stepIndex]

        if (!step || step.isRestDay || !step.shiftTypeId || !step.shiftType)
          continue

        const shiftConfig = configMap.get(step.shiftTypeId)
        if (!shiftConfig)
          continue

        const proposedStart = combineDateAndTime(currentDate, shiftConfig)
        const proposedEnd = calculateEndTime(proposedStart, step.shiftType.durationMinutes)

        for (const member of group.members) {
          shiftsPerGroupMap.set(group.id, (shiftsPerGroupMap.get(group.id) ?? 0) + 1)

          const existingShifts = await prisma.shift.findMany({
            where: {
              userId: member.userId,
              organizationId,
              startTime: { lt: proposedEnd },
              endTime: { gt: proposedStart },
            },
            select: {
              id: true,
              startTime: true,
              endTime: true,
              shiftType: {
                select: { name: true },
              },
            },
          })

          for (const existing of existingShifts)
            conflicts.push({
              userId: member.userId,
              userName: member.user.name ?? '',
              date: currentDate,
              existingShift: {
                id: existing.id,
                shiftType: existing.shiftType.name,
                startTime: existing.startTime,
                endTime: existing.endTime,
              },
              proposedShift: {
                shiftType: step.shiftType.name,
                startTime: proposedStart,
                endTime: proposedEnd,
              },
            })
        }
      }
    }

    const totalShiftsToCreate = Array.from(shiftsPerGroupMap.values()).reduce((sum, n) => sum + n, 0)

    const shiftsPerGroup = rotation.groups.map((group) => ({
      groupId: group.id,
      groupName: group.name,
      shiftCount: shiftsPerGroupMap.get(group.id) ?? 0,
    }))

    return {
      success: true,
      data: {
        totalShiftsToCreate,
        shiftsPerGroup,
        conflicts,
        dateRange: {
          start: validatedData.startDate,
          end: validatedData.endDate,
        },
        daysInRange,
      },
    }
  } catch (error) {
    console.error('[previewGenerationAction] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al previsualizar generación',
    }
  }
}

export const generateShiftsAction = async (
  data: z.infer<typeof generateShiftsSchema>
): Promise<ActionResult<GenerationResult>> => {
  try {
    const session = await requireAdminHROrChiefArea()

    let derivedOrgId: string | null = session.organizationId ?? null
    if (isChiefArea(session) && !derivedOrgId) {
      const firstArea = await prisma.userArea.findFirst({
        where: { userId: session.id },
        select: { area: { select: { organizationId: true } } },
      })
      derivedOrgId = firstArea?.area?.organizationId ?? null
    }
    if (!derivedOrgId)
      return { success: false, error: 'No tienes una organización asignada' }
    const organizationId = derivedOrgId

    const validatedData = generateShiftsSchema.parse(data)

    const rotation = await prisma.rotation.findFirst({
      where: { id: validatedData.rotationId, organizationId },
      select: {
        id: true,
        areaId: true,
        startDate: true,
        steps: {
          orderBy: { order: 'asc' as const },
          select: {
            id: true,
            order: true,
            isRestDay: true,
            shiftTypeId: true,
          },
        },
        shiftConfigs: {
          select: {
            shiftTypeId: true,
            startTime: true,
          },
        },
        groups: {
          select: {
            id: true,
            cycleOffset: true,
            members: {
              where: { leftAt: null },
              select: {
                userId: true,
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!rotation)
      return { success: false, error: 'Rotativa no encontrada' }

    if (isChiefArea(session)) {
      const chiefArea = await prisma.userArea.findFirst({
        where: { userId: session.id, areaId: rotation.areaId },
      })
      if (!chiefArea)
        return { success: false, error: 'Solo puedes gestionar rotativas en las áreas que tienes asignadas' }
    }

    const patternLength = rotation.steps.length
    if (patternLength === 0)
      return { success: false, error: 'La rotativa no tiene pasos definidos' }

    const configMap = new Map<string, string>()
    for (const cfg of rotation.shiftConfigs)
      configMap.set(cfg.shiftTypeId, cfg.startTime)

    const shiftTypeIds = [
      ...new Set(
        rotation.steps
          .filter((s) => !s.isRestDay && s.shiftTypeId != null)
          .map((s) => s.shiftTypeId as string)
      ),
    ]

    const shiftTypes = await prisma.shiftType.findMany({
      where: { id: { in: shiftTypeIds }, organizationId },
      select: { id: true, durationMinutes: true, name: true },
    })

    const shiftTypeMap = new Map<string, { durationMinutes: number; name: string }>()
    for (const st of shiftTypes)
      shiftTypeMap.set(st.id, { durationMinutes: st.durationMinutes, name: st.name })

    const effectiveOrigin = rotation.startDate ?? validatedData.startDate
    const daysInRange = daysBetween(validatedData.startDate, validatedData.endDate) + 1

    type ShiftCreateData = {
      userId: string
      areaId: string
      shiftTypeId: string
      organizationId: string
      startTime: Date
      endTime: Date
      status: 'SCHEDULED'
      contractId: string | null
      rotationId: string
      rotationGroupId: string
    }

    const shiftsToCreate: ShiftCreateData[] = []
    let shiftsSkipped = 0
    let conflictsDetected = 0
    const notifiedUserIds = new Set<string>()

    for (let d = 0; d < daysInRange; d++) {
      const currentDate = new Date(
        Date.UTC(
          validatedData.startDate.getUTCFullYear(),
          validatedData.startDate.getUTCMonth(),
          validatedData.startDate.getUTCDate() + d,
        )
      )

      const dayIndex = daysBetween(effectiveOrigin, currentDate)

      for (const group of rotation.groups) {
        const stepIndex = getStepForDay(patternLength, group.cycleOffset, dayIndex)
        const step = rotation.steps[stepIndex]

        if (!step || step.isRestDay || !step.shiftTypeId)
          continue

        const shiftConfig = configMap.get(step.shiftTypeId)
        const shiftType = shiftTypeMap.get(step.shiftTypeId)

        if (!shiftConfig || !shiftType)
          continue

        const proposedStart = combineDateAndTime(currentDate, shiftConfig)
        const proposedEnd = calculateEndTime(proposedStart, shiftType.durationMinutes)

        for (const member of group.members) {
          if (!validatedData.overrideConflicts) {
            const conflictingShift = await prisma.shift.findFirst({
              where: {
                userId: member.userId,
                organizationId,
                startTime: { lt: proposedEnd },
                endTime: { gt: proposedStart },
              },
              select: { id: true },
            })

            if (conflictingShift) {
              conflictsDetected++
              shiftsSkipped++
              continue
            }
          }

          const contract = await prisma.contract.findFirst({
            where: {
              userId: member.userId,
              organizationId,
              isActive: true,
              OR: [{ areaId: rotation.areaId }, { areaId: null }],
            },
            orderBy: [{ areaId: 'desc' }, { startDate: 'desc' }],
            select: { id: true },
          })

          shiftsToCreate.push({
            userId: member.userId,
            areaId: rotation.areaId,
            shiftTypeId: step.shiftTypeId,
            organizationId,
            startTime: proposedStart,
            endTime: proposedEnd,
            status: 'SCHEDULED',
            contractId: contract?.id ?? null,
            rotationId: rotation.id,
            rotationGroupId: group.id,
          })

          notifiedUserIds.add(member.userId)
        }
      }
    }

    await prisma.shift.createMany({ data: shiftsToCreate })

    const notificationPromises = Array.from(notifiedUserIds).map((userId) =>
      createNotification({
        type: 'ROTATION_SHIFTS_GENERATED',
        userId,
        actorId: session.id,
        organizationId,
        title: 'Se han generado turnos de rotativa',
        actionUrl: '/dashboard/shifts',
      })
    )

    await Promise.all(notificationPromises)

    revalidatePath('/dashboard/shifts')
    revalidatePath('/dashboard/rotations')
    revalidatePath('/dashboard/calendar')

    return {
      success: true,
      data: {
        shiftsCreated: shiftsToCreate.length,
        shiftsSkipped,
        conflictsDetected,
        notificationsSent: notifiedUserIds.size,
      },
      message: `Se crearon ${shiftsToCreate.length} turnos exitosamente`,
    }
  } catch (error) {
    console.error('[generateShiftsAction] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al generar turnos',
    }
  }
}

export const getCoverageOverviewAction = async (
  rotationId: string,
  startDate: Date,
  endDate: Date
): Promise<ActionResult<CoverageOverview>> => {
  try {
    const session = await requireAdminHROrChiefArea()

    let derivedOrgId: string | null = session.organizationId ?? null
    if (isChiefArea(session) && !derivedOrgId) {
      const firstArea = await prisma.userArea.findFirst({
        where: { userId: session.id },
        select: { area: { select: { organizationId: true } } },
      })
      derivedOrgId = firstArea?.area?.organizationId ?? null
    }
    if (!derivedOrgId)
      return { success: false, error: 'No tienes una organización asignada' }
    const organizationId = derivedOrgId

    const rotation = await prisma.rotation.findFirst({
      where: { id: rotationId, organizationId },
      select: {
        id: true,
        name: true,
        areaId: true,
        startDate: true,
        steps: {
          orderBy: { order: 'asc' as const },
          select: {
            order: true,
            isRestDay: true,
            shiftTypeId: true,
            shiftType: {
              select: {
                id: true,
                name: true,
                color: true,
              },
            },
          },
        },
        shiftConfigs: {
          select: {
            shiftTypeId: true,
            startTime: true,
          },
        },
        groups: {
          select: {
            id: true,
            name: true,
            cycleOffset: true,
            _count: {
              select: { members: { where: { leftAt: null } } },
            },
          },
        },
      },
    })

    if (!rotation)
      return { success: false, error: 'Rotativa no encontrada' }

    if (isChiefArea(session)) {
      const chiefArea = await prisma.userArea.findFirst({
        where: { userId: session.id, areaId: rotation.areaId },
      })
      if (!chiefArea)
        return { success: false, error: 'Solo puedes gestionar rotativas en las áreas que tienes asignadas' }
    }

    const rotationInput = {
      id: rotation.id,
      name: rotation.name,
      startDate: rotation.startDate,
      steps: rotation.steps.map((s) => ({
        order: s.order,
        isRestDay: s.isRestDay,
        shiftTypeId: s.shiftTypeId,
        shiftTypeName: s.shiftType?.name ?? null,
        shiftTypeColor: s.shiftType?.color ?? null,
        minStaffRequired: 0,
      })),
      groups: rotation.groups.map((g) => ({
        id: g.id,
        name: g.name,
        cycleOffset: g.cycleOffset,
        memberCount: g._count.members,
      })),
    }

    const coverageDays = calculateCoverage(rotationInput, startDate, endDate)

    const groupIds = rotation.groups.map((g) => g.id)

    const rawShifts = await prisma.shift.findMany({
      where: {
        rotationId,
        rotationGroupId: { in: groupIds },
        startTime: { gte: startDate, lte: endDate },
      },
      select: {
        rotationGroupId: true,
        startTime: true,
      },
    })

    const generatedShiftSet = new Set<string>()
    for (const s of rawShifts) {
      const dateKey = s.startTime.toISOString().slice(0, 10)
      generatedShiftSet.add(`${s.rotationGroupId}:${dateKey}`)
    }

    const days: CoverageDay[] = coverageDays.map((cd) => {
      const dateKey = cd.date.toISOString().slice(0, 10)
      const groups = cd.groups.map((g) => ({
        ...g,
        hasGeneratedShifts: g.stepType === 'shift'
          ? generatedShiftSet.has(`${g.groupId}:${dateKey}`)
          : false,
      }))
      return {
        date: cd.date,
        groups,
        totalOnDuty: cd.totalOnDuty,
        hasGap: cd.hasGap,
      }
    })

    const alerts: CoverageAlert[] = []

    for (const day of days) {
      if (day.hasGap)
        alerts.push({
          type: 'gap',
          severity: 'error',
          message: `Sin cobertura el ${day.date.toISOString().slice(0, 10)}`,
          date: day.date,
        })

      for (const g of day.groups)
        if (g.stepType === 'shift' && g.isUnderstaffed)
          alerts.push({
            type: 'understaffed',
            severity: 'warning',
            message: `Grupo "${g.groupName}" con dotación insuficiente el ${day.date.toISOString().slice(0, 10)}`,
            date: day.date,
          })
    }

    const daysWithShifts = days.filter((d) =>
      d.groups.some((g) => g.hasGeneratedShifts)
    )

    if (daysWithShifts.length > 0) {
      const lastGeneratedDay = daysWithShifts[daysWithShifts.length - 1]
      const msPerDay = 1000 * 60 * 60 * 24
      const daysUntilEnd = Math.floor(
        (endDate.getTime() - lastGeneratedDay.date.getTime()) / msPerDay
      )
      if (daysUntilEnd < 7)
        alerts.push({
          type: 'coverage_expiring',
          severity: 'warning',
          message: `La cobertura generada vence en ${daysUntilEnd} día(s)`,
          date: lastGeneratedDay.date,
        })
    }

    return {
      success: true,
      data: {
        rotationId: rotation.id,
        rotationName: rotation.name,
        days,
        dateRange: { start: startDate, end: endDate },
        alerts,
      },
    }
  } catch (error) {
    console.error('[getCoverageOverviewAction] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener cobertura',
    }
  }
}

export const regenerateShiftsAction = async (
  data: z.infer<typeof regenerateShiftsSchema>
): Promise<ActionResult<GenerationResult>> => {
  try {
    const session = await requireAdminHROrChiefArea()

    let derivedOrgId: string | null = session.organizationId ?? null
    if (isChiefArea(session) && !derivedOrgId) {
      const firstArea = await prisma.userArea.findFirst({
        where: { userId: session.id },
        select: { area: { select: { organizationId: true } } },
      })
      derivedOrgId = firstArea?.area?.organizationId ?? null
    }
    if (!derivedOrgId)
      return { success: false, error: 'No tienes una organización asignada' }
    const organizationId = derivedOrgId

    const validatedData = regenerateShiftsSchema.parse(data)

    const rotation = await prisma.rotation.findFirst({
      where: { id: validatedData.rotationId, organizationId },
      select: {
        id: true,
        areaId: true,
        startDate: true,
        steps: {
          orderBy: { order: 'asc' as const },
          select: {
            id: true,
            order: true,
            isRestDay: true,
            shiftTypeId: true,
            shiftType: {
              select: {
                id: true,
                name: true,
                durationMinutes: true,
              },
            },
          },
        },
        shiftConfigs: {
          select: {
            shiftTypeId: true,
            startTime: true,
          },
        },
        groups: {
          select: {
            id: true,
            cycleOffset: true,
            members: {
              where: { leftAt: null },
              select: {
                userId: true,
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!rotation)
      return { success: false, error: 'Rotativa no encontrada' }

    if (isChiefArea(session)) {
      const chiefArea = await prisma.userArea.findFirst({
        where: { userId: session.id, areaId: rotation.areaId },
      })
      if (!chiefArea)
        return { success: false, error: 'Solo puedes gestionar rotativas en las áreas que tienes asignadas' }
    }

    const patternLength = rotation.steps.length
    if (patternLength === 0)
      return { success: false, error: 'La rotativa no tiene pasos definidos' }

    if (validatedData.replaceExisting)
      await prisma.shift.deleteMany({
        where: {
          rotationId: validatedData.rotationId,
          startTime: { gte: validatedData.startDate, lte: validatedData.endDate },
          isManuallyModified: false,
        },
      })

    const configMap = new Map<string, string>()
    for (const cfg of rotation.shiftConfigs)
      configMap.set(cfg.shiftTypeId, cfg.startTime)

    const shiftTypeIds = [
      ...new Set(
        rotation.steps
          .filter((s) => !s.isRestDay && s.shiftTypeId != null)
          .map((s) => s.shiftTypeId as string)
      ),
    ]

    const shiftTypes = await prisma.shiftType.findMany({
      where: { id: { in: shiftTypeIds }, organizationId },
      select: { id: true, durationMinutes: true, name: true },
    })

    const shiftTypeMap = new Map<string, { durationMinutes: number; name: string }>()
    for (const st of shiftTypes)
      shiftTypeMap.set(st.id, { durationMinutes: st.durationMinutes, name: st.name })

    const effectiveOrigin = rotation.startDate ?? validatedData.startDate
    const daysInRange = daysBetween(validatedData.startDate, validatedData.endDate) + 1

    type ShiftCreateData = {
      userId: string
      areaId: string
      shiftTypeId: string
      organizationId: string
      startTime: Date
      endTime: Date
      status: 'SCHEDULED'
      contractId: string | null
      rotationId: string
      rotationGroupId: string
    }

    const shiftsToCreate: ShiftCreateData[] = []
    let shiftsSkipped = 0
    let conflictsDetected = 0
    const notifiedUserIds = new Set<string>()

    for (let d = 0; d < daysInRange; d++) {
      const currentDate = new Date(
        Date.UTC(
          validatedData.startDate.getUTCFullYear(),
          validatedData.startDate.getUTCMonth(),
          validatedData.startDate.getUTCDate() + d,
        )
      )

      const dayIndex = daysBetween(effectiveOrigin, currentDate)

      for (const group of rotation.groups) {
        const stepIndex = getStepForDay(patternLength, group.cycleOffset, dayIndex)
        const step = rotation.steps[stepIndex]

        if (!step || step.isRestDay || !step.shiftTypeId)
          continue

        const shiftConfig = configMap.get(step.shiftTypeId)
        const shiftType = shiftTypeMap.get(step.shiftTypeId)

        if (!shiftConfig || !shiftType)
          continue

        const proposedStart = combineDateAndTime(currentDate, shiftConfig)
        const proposedEnd = calculateEndTime(proposedStart, shiftType.durationMinutes)

        for (const member of group.members) {
          const conflictingShift = await prisma.shift.findFirst({
            where: {
              userId: member.userId,
              organizationId,
              startTime: { lt: proposedEnd },
              endTime: { gt: proposedStart },
            },
            select: { id: true },
          })

          if (conflictingShift) {
            conflictsDetected++
            shiftsSkipped++
            continue
          }

          const contract = await prisma.contract.findFirst({
            where: {
              userId: member.userId,
              organizationId,
              isActive: true,
              OR: [{ areaId: rotation.areaId }, { areaId: null }],
            },
            orderBy: [{ areaId: 'desc' }, { startDate: 'desc' }],
            select: { id: true },
          })

          shiftsToCreate.push({
            userId: member.userId,
            areaId: rotation.areaId,
            shiftTypeId: step.shiftTypeId,
            organizationId,
            startTime: proposedStart,
            endTime: proposedEnd,
            status: 'SCHEDULED',
            contractId: contract?.id ?? null,
            rotationId: rotation.id,
            rotationGroupId: group.id,
          })

          notifiedUserIds.add(member.userId)
        }
      }
    }

    await prisma.shift.createMany({ data: shiftsToCreate })

    const notificationPromises = Array.from(notifiedUserIds).map((userId) =>
      createNotification({
        type: 'ROTATION_SHIFTS_GENERATED',
        userId,
        actorId: session.id,
        organizationId,
        title: 'Se han regenerado turnos de rotativa',
        actionUrl: '/dashboard/shifts',
      })
    )

    await Promise.all(notificationPromises)

    revalidatePath('/dashboard/shifts')
    revalidatePath('/dashboard/rotations')
    revalidatePath('/dashboard/calendar')

    return {
      success: true,
      data: {
        shiftsCreated: shiftsToCreate.length,
        shiftsSkipped,
        conflictsDetected,
        notificationsSent: notifiedUserIds.size,
      },
      message: `Se regeneraron ${shiftsToCreate.length} turnos exitosamente`,
    }
  } catch (error) {
    console.error('[regenerateShiftsAction] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al regenerar turnos',
    }
  }
}

export const checkCoverageAlertsAction = async (): Promise<
  ActionResult<Array<{ rotationId: string; rotationName: string; alerts: CoverageAlert[] }>>
> => {
  try {
    const session = await requireAdminHROrChiefArea()

    let derivedOrgId: string | null = session.organizationId ?? null
    if (isChiefArea(session) && !derivedOrgId) {
      const firstArea = await prisma.userArea.findFirst({
        where: { userId: session.id },
        select: { area: { select: { organizationId: true } } },
      })
      derivedOrgId = firstArea?.area?.organizationId ?? null
    }
    if (!derivedOrgId)
      return { success: false, error: 'No tienes una organización asignada' }
    const organizationId = derivedOrgId

    let areaIds: string[]

    if (isChiefArea(session)) {
      const userAreas = await prisma.userArea.findMany({
        where: { userId: session.id },
        select: { areaId: true },
      })
      areaIds = userAreas.map((ua) => ua.areaId)
    } else {
      const areas = await prisma.area.findMany({
        where: { organizationId },
        select: { id: true },
      })
      areaIds = areas.map((a) => a.id)
    }

    if (areaIds.length === 0)
      return { success: true, data: [] }

    const rotations = await prisma.rotation.findMany({
      where: { areaId: { in: areaIds }, organizationId, status: 'ACTIVE' },
      select: { id: true, name: true },
    })

    if (rotations.length === 0)
      return { success: true, data: [] }

    const rotationIds = rotations.map((r) => r.id)

    const maxShiftByRotation = await prisma.shift.groupBy({
      by: ['rotationId'],
      where: { rotationId: { in: rotationIds } },
      _max: { startTime: true },
    })

    const maxShiftMap = new Map<string, Date>()
    for (const row of maxShiftByRotation)
      if (row.rotationId && row._max.startTime)
        maxShiftMap.set(row.rotationId, row._max.startTime)

    const now = new Date()
    const msPerDay = 1000 * 60 * 60 * 24
    const result: Array<{ rotationId: string; rotationName: string; alerts: CoverageAlert[] }> = []

    for (const rotation of rotations) {
      const alerts: CoverageAlert[] = []
      const lastShiftDate = maxShiftMap.get(rotation.id)

      if (!lastShiftDate)
        alerts.push({
          type: 'coverage_expiring',
          severity: 'warning',
          message: 'No hay turnos generados',
        })
      else {
        const daysRemaining = Math.floor((lastShiftDate.getTime() - now.getTime()) / msPerDay)
        if (daysRemaining < 7)
          alerts.push({
            type: 'coverage_expiring',
            severity: 'warning',
            message: `La cobertura generada vence en ${Math.max(0, daysRemaining)} día(s)`,
            date: lastShiftDate,
          })
      }

      if (alerts.length > 0)
        result.push({ rotationId: rotation.id, rotationName: rotation.name, alerts })
    }

    return { success: true, data: result }
  } catch (error) {
    console.error('[checkCoverageAlertsAction] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al verificar alertas de cobertura',
    }
  }
}
