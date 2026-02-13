import { ApplyCondition, ComponentUnit } from '@prisma/client'

import type { ComponentCalculation, PaymentComponent, ShiftContext } from './types'

const PAYROLL_UNITS: ComponentUnit[] = [
  ComponentUnit.MONTHLY,
  ComponentUnit.BIWEEKLY,
  ComponentUnit.WEEKLY,
]

function buildResult(
  component: PaymentComponent,
  overrides: Partial<ComponentCalculation>
): ComponentCalculation {
  return {
    componentId: component.id,
    componentName: component.customName ?? component.type,
    componentType: component.type,
    baseValue: component.value,
    calculatedValue: 0,
    appliedMinutes: null,
    notes: null,
    skipped: false,
    skipReason: null,
    ...overrides,
  }
}

function getApplicableMinutes(component: PaymentComponent, context: ShiftContext): number {
  return component.applyCondition === ApplyCondition.OVERTIME_ONLY
    ? context.overtimeMinutes
    : context.actualMinutes
}

export function calculateComponentValue(
  component: PaymentComponent,
  context: ShiftContext,
  runningBaseAmount: number
): ComponentCalculation {
  if (PAYROLL_UNITS.includes(component.unit))
    return buildResult(component, { skipped: true, skipReason: 'payroll_unit' })

  switch (component.unit) {
    case ComponentUnit.DAILY:
    case ComponentUnit.PER_SHIFT:
    case ComponentUnit.FIXED_AMOUNT:
      return buildResult(component, { calculatedValue: component.value })

    case ComponentUnit.PER_MINUTE: {
      const minutes = getApplicableMinutes(component, context)
      return buildResult(component, {
        calculatedValue: component.value * minutes,
        appliedMinutes: minutes,
      })
    }

    case ComponentUnit.PER_HOUR: {
      const minutes = getApplicableMinutes(component, context)
      return buildResult(component, {
        calculatedValue: component.value * (minutes / 60),
        appliedMinutes: minutes,
      })
    }

    case ComponentUnit.PERCENTAGE:
      return buildResult(component, {
        calculatedValue: runningBaseAmount * (component.value / 100),
      })

    case ComponentUnit.MULTIPLIER:
      return buildResult(component, {
        calculatedValue: runningBaseAmount * (component.value - 1),
      })

    default:
      return buildResult(component, { skipped: true, skipReason: 'unknown_unit' })
  }
}
