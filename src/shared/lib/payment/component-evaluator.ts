import type { ApplyCondition, DayType } from '@prisma/client'

import type { ComponentEvaluationContext } from './types'

interface EvaluableComponent {
  applyCondition: ApplyCondition
  conditionValue: string | null
  extraOnly: boolean
  applicableShiftTypes?: { shiftTypeId: string }[]
}

const WEEKDAY_TYPES: DayType[] = ['NORMAL']
const WEEKEND_TYPES: DayType[] = ['WEEKEND', 'SATURDAY', 'SUNDAY']
const HOLIDAY_TYPES: DayType[] = ['HOLIDAY', 'ORGANIZATION_HOLIDAY']

export function evaluateComponent(
  component: EvaluableComponent,
  context: ComponentEvaluationContext
): boolean {
  if (component.extraOnly && !context.isExtra) return false

  switch (component.applyCondition) {
    case 'ALWAYS':
      return true

    case 'WEEKDAY_ONLY':
      return WEEKDAY_TYPES.includes(context.dayType)

    case 'WEEKEND_ONLY':
      return WEEKEND_TYPES.includes(context.dayType)

    case 'SATURDAY_ONLY':
      return context.dayType === 'SATURDAY'

    case 'SUNDAY_ONLY':
      return context.dayType === 'SUNDAY'

    case 'HOLIDAY_ONLY':
      return HOLIDAY_TYPES.includes(context.dayType)

    case 'IRRENUNCIABLE_ONLY':
      return context.dayType === 'IRRENUNCIABLE'

    case 'OVERTIME_ONLY':
      return context.isExtra

    case 'EXTRA_SHIFT_ONLY':
      return context.isExtra

    case 'SPECIFIC_AREA':
      return component.conditionValue === context.areaId

    case 'SPECIFIC_SHIFT_TYPE':
      if (component.applicableShiftTypes && component.applicableShiftTypes.length > 0)
        return component.applicableShiftTypes.some((ast) => ast.shiftTypeId === context.shiftTypeId)

      return component.conditionValue === context.shiftTypeId

    case 'CUSTOM_RULE':
      return true

    default:
      return false
  }
}
