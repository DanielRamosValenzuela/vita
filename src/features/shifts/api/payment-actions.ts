'use server'

import { revalidatePath } from 'next/cache'
import { PaymentStatus, ShiftStatus } from '@prisma/client'

import { requireAdminHROrChiefArea } from '@/src/shared/lib/auth/session'
import { ROLES } from '@/src/shared/lib/constants'
import { prisma } from '@/src/shared/lib/db'
import type { ActionResult } from '@/src/shared/lib/types'
import { handleActionError } from '@/src/shared/lib/utils/action-error-handler'

import {
  calculatePayment,
  type PaymentCalculationInput,
  type PaymentComponent,
} from '@/src/entities/shift-payment'

const NON_PAYABLE_STATUSES: ShiftStatus[] = [ShiftStatus.CANCELLED, ShiftStatus.NO_SHOW]

const MAX_BULK_SHIFTS = 100

interface ShiftPaymentResult {
  paymentId: string
  shiftId: string
  baseAmount: number
  totalAmount: number
  calendarMultiplier: number
  finalAmount: number
  minutesWorked: number
  isPartialCompletion: boolean
  breakdownCount: number
}

interface BulkPaymentResult {
  succeeded: { shiftId: string; paymentId: string; finalAmount: number }[]
  failed: { shiftId: string; error: string }[]
}

async function resolveContractForShift(userId: string, organizationId: string, areaId: string) {
  const areaContract = await prisma.contract.findFirst({
    where: {
      userId,
      organizationId,
      areaId,
      isActive: true,
    },
    orderBy: { startDate: 'desc' },
  })
  if (areaContract) return areaContract

  return prisma.contract.findFirst({
    where: {
      userId,
      organizationId,
      areaId: null,
      isActive: true,
    },
    orderBy: { startDate: 'desc' },
  })
}

async function fetchShiftForPayment(shiftId: string, organizationId: string) {
  return prisma.shift.findFirst({
    where: {
      id: shiftId,
      organizationId,
    },
    include: {
      shiftType: {
        select: {
          id: true,
          classification: true,
          durationMinutes: true,
        },
      },
      organization: {
        select: { currency: true },
      },
    },
  })
}

async function fetchContractWithComponents(contractId: string) {
  return prisma.contract.findUnique({
    where: { id: contractId },
    include: {
      rateTemplate: {
        include: {
          components: {
            include: {
              applicableShiftTypes: {
                select: { shiftTypeId: true },
              },
            },
            orderBy: { order: 'asc' },
          },
        },
      },
    },
  })
}

async function fetchCalendarDay(organizationId: string, date: Date) {
  const startOfDay = new Date(date)
  startOfDay.setUTCHours(0, 0, 0, 0)
  const endOfDay = new Date(startOfDay)
  endOfDay.setUTCDate(endOfDay.getUTCDate() + 1)

  return prisma.organizationCalendar.findFirst({
    where: {
      organizationId,
      date: {
        gte: startOfDay,
        lt: endOfDay,
      },
    },
  })
}

function mapComponents(
  contract: NonNullable<Awaited<ReturnType<typeof fetchContractWithComponents>>>
): PaymentComponent[] {
  return contract.rateTemplate.components.map((c) => ({
    id: c.id,
    type: c.type,
    customName: c.customName,
    value: c.value,
    unit: c.unit,
    applyCondition: c.applyCondition,
    conditionValue: c.conditionValue,
    order: c.order,
    applicableShiftTypeIds: c.applicableShiftTypes.map((ast) => ast.shiftTypeId),
  }))
}

export async function calculateShiftPaymentAction(
  shiftId: string
): Promise<ActionResult<ShiftPaymentResult>> {
  try {
    const session = await requireAdminHROrChiefArea()
    if (!session.organizationId) return { success: false, error: 'No organization assigned' }

    const shift = await fetchShiftForPayment(shiftId, session.organizationId)
    if (!shift)
      return { success: false, error: 'Shift not found or does not belong to your organization' }

    if (NON_PAYABLE_STATUSES.includes(shift.status))
      return { success: false, error: 'Cannot calculate payment for cancelled or no-show shifts' }

    if (session.role === ROLES.CHIEF_AREA) {
      const chiefArea = await prisma.userArea.findFirst({
        where: { userId: session.id, areaId: shift.areaId },
      })
      if (!chiefArea)
        return { success: false, error: 'You can only calculate payments for shifts in your areas' }
    }

    let contractId = shift.contractId
    if (!contractId) {
      const resolved = await resolveContractForShift(
        shift.userId,
        session.organizationId,
        shift.areaId
      )
      if (!resolved) return { success: false, error: 'No active contract found for this user' }

      contractId = resolved.id

      await prisma.shift.update({
        where: { id: shiftId },
        data: { contractId },
      })
    }

    const contractData = await fetchContractWithComponents(contractId)
    if (!contractData) return { success: false, error: 'Contract not found' }

    const calendarDay = await fetchCalendarDay(session.organizationId, shift.startTime)

    const input: PaymentCalculationInput = {
      shift: {
        id: shift.id,
        startTime: shift.startTime,
        endTime: shift.endTime,
        actualStartTime: shift.actualStartTime,
        actualEndTime: shift.actualEndTime,
        shiftTypeId: shift.shiftTypeId,
        areaId: shift.areaId,
      },
      shiftType: shift.shiftType,
      contract: {
        id: contractData.id,
        customMultiplier: contractData.customMultiplier,
      },
      components: mapComponents(contractData),
      calendarDay: calendarDay
        ? { type: calendarDay.type, multiplier: calendarDay.multiplier }
        : null,
      currency: shift.organization.currency,
    }

    const result = calculatePayment(input)

    const payment = await prisma.$transaction(async (tx) => {
      await tx.shiftPayment.deleteMany({ where: { shiftId } })

      return tx.shiftPayment.create({
        data: {
          shiftId,
          baseAmount: result.baseAmount,
          totalAmount: result.totalAmount,
          calendarMultiplier: result.calendarMultiplier,
          finalAmount: result.finalAmount,
          minutesWorked: result.minutesWorked,
          isPartialCompletion: result.isPartialCompletion,
          status: PaymentStatus.CALCULATED,
          breakdowns: {
            create: result.breakdowns
              .filter((b) => !b.skipped)
              .map((b) => ({
                componentId: b.componentId,
                componentName: b.componentName,
                componentType: b.componentType,
                baseValue: b.baseValue,
                calculatedValue: b.calculatedValue,
                appliedMinutes: b.appliedMinutes,
                notes: b.notes,
              })),
          },
        },
      })
    })

    revalidatePath('/dashboard/shifts')
    revalidatePath(`/dashboard/shifts/${shiftId}`)

    return {
      success: true,
      data: {
        paymentId: payment.id,
        shiftId,
        baseAmount: result.baseAmount,
        totalAmount: result.totalAmount,
        calendarMultiplier: result.calendarMultiplier,
        finalAmount: result.finalAmount,
        minutesWorked: result.minutesWorked,
        isPartialCompletion: result.isPartialCompletion,
        breakdownCount: result.breakdowns.filter((b) => !b.skipped).length,
      },
      message: 'Payment calculated successfully',
    }
  } catch (error) {
    return handleActionError(error, 'calculateShiftPaymentAction', 'Error calculating payment')
  }
}

export async function recalculateShiftPaymentAction(
  shiftId: string
): Promise<ActionResult<ShiftPaymentResult>> {
  return calculateShiftPaymentAction(shiftId)
}

export async function getShiftPaymentAction(shiftId: string): Promise<
  ActionResult<{
    payment: {
      id: string
      totalAmount: number
      baseAmount: number
      calendarMultiplier: number
      finalAmount: number
      minutesWorked: number
      isPartialCompletion: boolean
      status: string
      calculatedAt: Date
      breakdowns: {
        id: string
        componentName: string
        componentType: string
        baseValue: number
        calculatedValue: number
        appliedMinutes: number | null
        notes: string | null
      }[]
    }
  }>
> {
  try {
    const session = await requireAdminHROrChiefArea()
    if (!session.organizationId) return { success: false, error: 'No organization assigned' }

    const shift = await prisma.shift.findFirst({
      where: { id: shiftId, organizationId: session.organizationId },
      select: { id: true, areaId: true },
    })

    if (!shift) return { success: false, error: 'Shift not found' }

    if (session.role === ROLES.CHIEF_AREA) {
      const chiefArea = await prisma.userArea.findFirst({
        where: { userId: session.id, areaId: shift.areaId },
      })
      if (!chiefArea)
        return { success: false, error: 'You can only view payments for shifts in your areas' }
    }

    const payment = await prisma.shiftPayment.findUnique({
      where: { shiftId },
      include: {
        breakdowns: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            componentName: true,
            componentType: true,
            baseValue: true,
            calculatedValue: true,
            appliedMinutes: true,
            notes: true,
          },
        },
      },
    })

    if (!payment) return { success: false, error: 'No payment found for this shift' }

    return {
      success: true,
      data: {
        payment: {
          id: payment.id,
          totalAmount: payment.totalAmount,
          baseAmount: payment.baseAmount,
          calendarMultiplier: payment.calendarMultiplier,
          finalAmount: payment.finalAmount,
          minutesWorked: payment.minutesWorked,
          isPartialCompletion: payment.isPartialCompletion,
          status: payment.status,
          calculatedAt: payment.calculatedAt,
          breakdowns: payment.breakdowns,
        },
      },
    }
  } catch (error) {
    return handleActionError(error, 'getShiftPaymentAction', 'Error fetching payment')
  }
}

export async function calculateBulkShiftPaymentsAction(
  shiftIds: string[]
): Promise<ActionResult<BulkPaymentResult>> {
  try {
    const session = await requireAdminHROrChiefArea()
    if (!session.organizationId) return { success: false, error: 'No organization assigned' }

    if (shiftIds.length === 0) return { success: false, error: 'No shift IDs provided' }

    if (shiftIds.length > MAX_BULK_SHIFTS)
      return { success: false, error: `Maximum ${MAX_BULK_SHIFTS} shifts per bulk operation` }

    const succeeded: BulkPaymentResult['succeeded'] = []
    const failed: BulkPaymentResult['failed'] = []

    for (const shiftId of shiftIds) {
      const result = await calculateShiftPaymentAction(shiftId)
      if (result.success && result.data)
        succeeded.push({
          shiftId,
          paymentId: result.data.paymentId,
          finalAmount: result.data.finalAmount,
        })
      else
        failed.push({
          shiftId,
          error: result.error ?? 'Unknown error',
        })
    }

    return {
      success: true,
      data: { succeeded, failed },
      message: `Calculated ${succeeded.length} payments, ${failed.length} failed`,
    }
  } catch (error) {
    return handleActionError(
      error,
      'calculateBulkShiftPaymentsAction',
      'Error in bulk payment calculation'
    )
  }
}
