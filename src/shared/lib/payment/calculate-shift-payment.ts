'use server'

import type { ComponentUnit, DayType } from '@prisma/client'

import { prisma } from '@/src/shared/lib/db'

import { evaluateComponent } from './component-evaluator'
import type { ComponentBreakdown, ComponentEvaluationContext, ShiftPaymentResult } from './types'

export async function calculateShiftPayment(shiftId: string): Promise<ShiftPaymentResult> {
  const shift = await prisma.shift.findUniqueOrThrow({
    where: { id: shiftId },
    include: {
      contract: {
        include: {
          rateTemplate: {
            include: {
              components: {
                where: { rateTemplate: { isActive: true } },
                include: {
                  applicableShiftTypes: true,
                },
                orderBy: { order: 'asc' },
              },
            },
          },
        },
      },
      shiftType: true,
      area: true,
      organization: true,
    },
  })

  if (!shift.contract || !shift.contract.rateTemplate) 
    throw new Error(`Shift ${shiftId} has no contract or rate template`)
  

  const contract = shift.contract
  const components = contract.rateTemplate.components

  
  const endTime = shift.actualEndTime ?? shift.endTime
  const startTime = shift.actualStartTime ?? shift.startTime
  const minutesWorked = Math.round((endTime.getTime() - startTime.getTime()) / 60000)
  const isPartialCompletion = shift.actualEndTime !== null && shift.actualEndTime < shift.endTime

  
  const shiftDate = new Date(shift.startTime)
  shiftDate.setHours(0, 0, 0, 0)

  const calendarDay = await prisma.organizationCalendar.findUnique({
    where: {
      organizationId_date: {
        organizationId: shift.organizationId,
        date: shiftDate,
      },
    },
  })

  const dayType: DayType = calendarDay?.type ?? getDayTypeFromDate(shiftDate)
  const calendarMultiplier = calendarDay?.multiplier ?? 1.0

  
  const context: ComponentEvaluationContext = {
    dayType,
    shiftTypeId: shift.shiftTypeId,
    areaId: shift.areaId,
    isExtra: shift.isExtra,
    classification: shift.shiftType.classification,
  }

  
  const breakdowns: ComponentBreakdown[] = []
  let baseAmount = 0

  for (const component of components) {
    
    if (component.type === 'BASE_SALARY') continue
    if (component.unit === 'MONTHLY' || component.unit === 'BIWEEKLY' || component.unit === 'WEEKLY') continue

    if (!evaluateComponent(component, context)) continue

    const calculatedValue = calculateComponentValue(
      component.value,
      component.unit,
      minutesWorked,
      baseAmount
    )

    breakdowns.push({
      componentId: component.id,
      componentName: component.customName ?? component.type,
      componentType: component.type,
      baseValue: component.value,
      calculatedValue,
      appliedMinutes: isMinuteBased(component.unit) ? minutesWorked : null,
    })

    
    if (!isMultiplierUnit(component.unit)) 
      baseAmount += calculatedValue
    
  }

  
  let totalAfterMultipliers = baseAmount
  for (const breakdown of breakdowns) 
    if (isMultiplierUnit(getUnitFromType(breakdown.componentType, components))) 
      totalAfterMultipliers = totalAfterMultipliers * breakdown.calculatedValue
    
  

  
  const customMultiplier = contract.customMultiplier ?? 1.0
  const totalAmount = totalAfterMultipliers * customMultiplier

  
  const finalAmount = totalAmount * calendarMultiplier

  
  const payment = await prisma.shiftPayment.create({
    data: {
      shiftId,
      totalAmount: Math.round(totalAmount * 100) / 100,
      baseAmount: Math.round(baseAmount * 100) / 100,
      calendarMultiplier,
      finalAmount: Math.round(finalAmount * 100) / 100,
      minutesWorked,
      isPartialCompletion,
      status: 'CALCULATED',
      breakdowns: {
        create: breakdowns.map((b) => ({
          componentId: b.componentId,
          componentName: b.componentName,
          componentType: b.componentType,
          baseValue: b.baseValue,
          calculatedValue: b.calculatedValue,
          appliedMinutes: b.appliedMinutes,
        })),
      },
    },
  })

  return {
    paymentId: payment.id,
    shiftId,
    baseAmount: payment.baseAmount,
    calendarMultiplier: payment.calendarMultiplier,
    finalAmount: payment.finalAmount,
    minutesWorked,
    isPartialCompletion,
    breakdowns,
  }
}



function calculateComponentValue(
  value: number,
  unit: ComponentUnit,
  minutesWorked: number,
  currentBase: number
): number {
  switch (unit) {
    case 'PER_SHIFT':
    case 'FIXED_AMOUNT':
    case 'DAILY':
      return value

    case 'PER_MINUTE':
      return value * minutesWorked

    case 'PER_HOUR':
      return value * (minutesWorked / 60)

    case 'PERCENTAGE':
      return currentBase * (value / 100)

    case 'MULTIPLIER':
      return value

    
    default:
      return value
  }
}

function isMinuteBased(unit: ComponentUnit): boolean {
  return unit === 'PER_MINUTE' || unit === 'PER_HOUR'
}

function isMultiplierUnit(unit: ComponentUnit | undefined): boolean {
  return unit === 'MULTIPLIER'
}

function getUnitFromType(
  componentType: string,
  components: { type: string; unit: ComponentUnit }[]
): ComponentUnit | undefined {
  return components.find((c) => c.type === componentType)?.unit
}

function getDayTypeFromDate(date: Date): DayType {
  const day = date.getDay()
  if (day === 0) return 'SUNDAY'
  if (day === 6) return 'SATURDAY'
  return 'NORMAL'
}
