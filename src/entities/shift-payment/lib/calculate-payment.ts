import { ComponentUnit, Currency, DayType } from '@prisma/client'

import type {
  PaymentCalculationInput,
  PaymentCalculationOutput,
  ShiftContext,
  ComponentCalculation,
} from './types'
import { evaluateCondition } from './evaluate-condition'
import { calculateComponentValue } from './calculate-component'

const RELATIVE_UNITS: ComponentUnit[] = [ComponentUnit.PERCENTAGE, ComponentUnit.MULTIPLIER]

const MINUTES_PER_MS = 1 / 60000

function inferDayType(dayOfWeek: number): DayType {
  if (dayOfWeek === 0) return DayType.SUNDAY
  if (dayOfWeek === 6) return DayType.SATURDAY
  return DayType.NORMAL
}

function roundForCurrency(amount: number, currency: Currency): number {
  if (currency === Currency.CLP) return Math.round(amount)
  return Math.round(amount * 100) / 100
}

export function calculatePayment(
  input: PaymentCalculationInput
): PaymentCalculationOutput {
  const { shift, shiftType, contract, components, calendarDay, currency } = input

  const scheduledMinutes = Math.round(
    (shift.endTime.getTime() - shift.startTime.getTime()) * MINUTES_PER_MS
  )

  const actualStart = shift.actualStartTime ?? shift.startTime
  const actualEnd = shift.actualEndTime ?? shift.endTime
  const actualMinutes = Math.max(
    0,
    Math.round((actualEnd.getTime() - actualStart.getTime()) * MINUTES_PER_MS)
  )

  const overtimeMinutes = Math.max(0, actualMinutes - scheduledMinutes)
  const isPartialCompletion = actualMinutes < scheduledMinutes

  const dayOfWeek = shift.startTime.getDay()
  const dayType = calendarDay?.type ?? inferDayType(dayOfWeek)

  const context: ShiftContext = {
    shiftTypeId: shift.shiftTypeId,
    areaId: shift.areaId,
    classification: shiftType.classification,
    scheduledMinutes,
    actualMinutes,
    overtimeMinutes,
    isPartialCompletion,
    dayType,
    dayOfWeek,
  }

  const sortedComponents = [...components].sort((a, b) => a.order - b.order)

  let baseAmount = 0
  const breakdowns: ComponentCalculation[] = []

  for (const component of sortedComponents) {
    if (RELATIVE_UNITS.includes(component.unit)) continue

    const conditionResult = evaluateCondition(
      component.applyCondition,
      component.conditionValue,
      component.applicableShiftTypeIds,
      context
    )

    if (!conditionResult.applies) {
      breakdowns.push({
        componentId: component.id,
        componentName: component.customName ?? component.type,
        componentType: component.type,
        baseValue: component.value,
        calculatedValue: 0,
        appliedMinutes: null,
        notes: null,
        skipped: true,
        skipReason: conditionResult.reason ?? 'condition_not_met',
      })
      continue
    }

    const calc = calculateComponentValue(component, context, 0)
    breakdowns.push(calc)

    if (!calc.skipped)
      baseAmount += calc.calculatedValue
  }

  let bonusAmount = 0

  for (const component of sortedComponents) {
    if (!RELATIVE_UNITS.includes(component.unit)) continue

    const conditionResult = evaluateCondition(
      component.applyCondition,
      component.conditionValue,
      component.applicableShiftTypeIds,
      context
    )

    if (!conditionResult.applies) {
      breakdowns.push({
        componentId: component.id,
        componentName: component.customName ?? component.type,
        componentType: component.type,
        baseValue: component.value,
        calculatedValue: 0,
        appliedMinutes: null,
        notes: null,
        skipped: true,
        skipReason: conditionResult.reason ?? 'condition_not_met',
      })
      continue
    }

    const calc = calculateComponentValue(component, context, baseAmount)
    breakdowns.push(calc)

    if (!calc.skipped)
      bonusAmount += calc.calculatedValue
  }

  const customMultiplier = contract.customMultiplier ?? 1
  const totalAmount = (baseAmount + bonusAmount) * customMultiplier

  const calendarMultiplier = calendarDay?.multiplier ?? 1.0
  const rawFinalAmount = totalAmount * calendarMultiplier

  const finalAmount = roundForCurrency(rawFinalAmount, currency)

  return {
    baseAmount: roundForCurrency(baseAmount, currency),
    totalAmount: roundForCurrency(totalAmount, currency),
    calendarMultiplier,
    finalAmount,
    minutesWorked: actualMinutes,
    isPartialCompletion,
    breakdowns,
    contractId: contract.id,
  }
}
