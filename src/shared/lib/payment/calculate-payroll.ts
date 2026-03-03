'use server'

import type { DayType } from '@prisma/client'
import { endOfMonth, getDaysInMonth, startOfMonth } from 'date-fns'

import { prisma } from '@/src/shared/lib/db'

import type {
  MonthlyComponentSummary,
  PayrollCalculationResult,
  ShiftPaymentSummary,
} from './types'

export async function calculatePayrollForUser(
  userId: string,
  organizationId: string,
  month: number,
  year: number
): Promise<PayrollCalculationResult | null> {
  const periodStart = startOfMonth(new Date(year, month - 1))
  const periodEnd = endOfMonth(new Date(year, month - 1))
  const totalDaysInPeriod = getDaysInMonth(new Date(year, month - 1))

  
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { id: true, name: true, email: true },
  })

  
  const org = await prisma.organization.findUniqueOrThrow({
    where: { id: organizationId },
    select: { currency: true },
  })

  
  const contracts = await prisma.contract.findMany({
    where: {
      userId,
      organizationId,
      isActive: true,
      startDate: { lte: periodEnd },
      OR: [{ endDate: null }, { endDate: { gte: periodStart } }],
    },
    include: {
      rateTemplate: {
        include: {
          components: {
            orderBy: { order: 'asc' },
          },
        },
      },
      area: { select: { id: true, name: true } },
    },
  })

  if (contracts.length === 0) return null

  
  const contractInfos = contracts.map((contract) => {
    const contractStart = contract.startDate > periodStart ? contract.startDate : periodStart
    const effectiveEnd = contract.endDate && contract.endDate < periodEnd ? contract.endDate : periodEnd
    const daysInPeriod = Math.max(
      0,
      Math.ceil((effectiveEnd.getTime() - contractStart.getTime()) / (1000 * 60 * 60 * 24)) + 1
    )

    return {
      contractId: contract.id,
      rateTemplateId: contract.rateTemplateId,
      rateTemplateName: contract.rateTemplate.name,
      areaId: contract.areaId,
      areaName: contract.area?.name ?? null,
      customMultiplier: contract.customMultiplier,
      daysInPeriod,
      totalDaysInPeriod,
      startDate: contract.startDate,
      endDate: contract.endDate,
      components: contract.rateTemplate.components,
    }
  })

  
  let baseSalaryAmount = 0
  const monthlyComponents: MonthlyComponentSummary[] = []

  for (const contractInfo of contractInfos) {
    const proration = contractInfo.daysInPeriod / totalDaysInPeriod

    for (const component of contractInfo.components) {
      if (component.type === 'BASE_SALARY') {
        const proratedValue = component.value * proration
        baseSalaryAmount += proratedValue
        continue
      }

      
      if (
        component.unit === 'MONTHLY' ||
        component.unit === 'BIWEEKLY' ||
        component.unit === 'WEEKLY'
      ) {
        let multiplier = 1
        if (component.unit === 'BIWEEKLY') multiplier = 2
        if (component.unit === 'WEEKLY') multiplier = 4

        const proratedValue = component.value * multiplier * proration

        monthlyComponents.push({
          componentId: component.id,
          componentName: component.customName ?? component.type,
          componentType: component.type,
          unit: component.unit,
          applyCondition: component.applyCondition,
          baseValue: component.value,
          proratedValue: Math.round(proratedValue * 100) / 100,
          contractDays: contractInfo.daysInPeriod,
          totalDays: totalDaysInPeriod,
        })
      }
    }
  }

  const monthlyComponentsAmount = monthlyComponents.reduce(
    (sum, mc) => sum + mc.proratedValue,
    0
  )

  
  const completedShifts = await prisma.shift.findMany({
    where: {
      userId,
      organizationId,
      status: 'COMPLETED',
      startTime: { gte: periodStart, lte: periodEnd },
      payment: {
        isNot: null,
      },
    },
    include: {
      payment: {
        include: {
          breakdowns: true,
        },
      },
      area: { select: { name: true } },
      shiftType: { select: { name: true } },
    },
    orderBy: { startTime: 'asc' },
  })

  const shifts: ShiftPaymentSummary[] = completedShifts
    .filter((s) => s.payment && s.payment.status !== 'DISPUTED')
    .map((s) => {
      const payment = s.payment!
      return {
        shiftId: s.id,
        date: s.startTime,
        areaName: s.area.name,
        shiftTypeName: s.shiftType.name,
        minutesWorked: payment.minutesWorked,
        finalAmount: payment.finalAmount,
        status: payment.status,
        isEstimated: s.actualEndTime === null,
        calendarMultiplier: payment.calendarMultiplier,
        dayType: getDayTypeFromDate(s.startTime) as DayType,
        breakdowns: payment.breakdowns.map((b) => ({
          componentId: b.componentId,
          componentName: b.componentName,
          componentType: b.componentType,
          baseValue: b.baseValue,
          calculatedValue: b.calculatedValue,
          appliedMinutes: b.appliedMinutes,
        })),
      }
    })

  const shiftsAmount = shifts.reduce((sum, s) => sum + s.finalAmount, 0)

  
  const totalAmount =
    Math.round(baseSalaryAmount * 100) / 100 +
    Math.round(shiftsAmount * 100) / 100 +
    Math.round(monthlyComponentsAmount * 100) / 100

  
  const contractDaysInPeriod = Math.max(
    ...contractInfos.map((c) => c.daysInPeriod)
  )

  return {
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    organizationId,
    month,
    year,
    currency: org.currency,
    contracts: contractInfos.map((c) => ({
      contractId: c.contractId,
      rateTemplateId: c.rateTemplateId,
      rateTemplateName: c.rateTemplateName,
      areaId: c.areaId,
      areaName: c.areaName,
      customMultiplier: c.customMultiplier,
      daysInPeriod: c.daysInPeriod,
      totalDaysInPeriod,
      startDate: c.startDate,
      endDate: c.endDate,
    })),
    baseSalaryAmount: Math.round(baseSalaryAmount * 100) / 100,
    shiftsAmount: Math.round(shiftsAmount * 100) / 100,
    monthlyComponentsAmount: Math.round(monthlyComponentsAmount * 100) / 100,
    totalAmount: Math.round(totalAmount * 100) / 100,
    shiftsCount: shifts.length,
    contractDaysInPeriod,
    totalDaysInPeriod,
    shifts,
    monthlyComponents,
  }
}

function getDayTypeFromDate(date: Date): string {
  const day = date.getDay()
  if (day === 0) return 'SUNDAY'
  if (day === 6) return 'SATURDAY'
  return 'NORMAL'
}
