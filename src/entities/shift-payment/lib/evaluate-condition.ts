import { ApplyCondition, DayType } from '@prisma/client'

import type { ShiftContext, ConditionResult } from './types'

const HOLIDAY_DAY_TYPES: DayType[] = [
  DayType.HOLIDAY,
  DayType.IRRENUNCIABLE,
  DayType.ORGANIZATION_HOLIDAY,
]

export function evaluateCondition(
  applyCondition: ApplyCondition,
  conditionValue: string | null,
  applicableShiftTypeIds: string[],
  context: ShiftContext
): ConditionResult {
  switch (applyCondition) {
    case ApplyCondition.ALWAYS:
      return { applies: true }

    case ApplyCondition.WEEKDAY_ONLY:
      return context.dayOfWeek >= 1 && context.dayOfWeek <= 5
        ? { applies: true }
        : { applies: false, reason: 'shift_not_weekday' }

    case ApplyCondition.WEEKEND_ONLY:
      return context.dayOfWeek === 0 || context.dayOfWeek === 6
        ? { applies: true }
        : { applies: false, reason: 'shift_not_weekend' }

    case ApplyCondition.SATURDAY_ONLY:
      return context.dayOfWeek === 6
        ? { applies: true }
        : { applies: false, reason: 'shift_not_saturday' }

    case ApplyCondition.SUNDAY_ONLY:
      return context.dayOfWeek === 0
        ? { applies: true }
        : { applies: false, reason: 'shift_not_sunday' }

    case ApplyCondition.HOLIDAY_ONLY:
      return HOLIDAY_DAY_TYPES.includes(context.dayType)
        ? { applies: true }
        : { applies: false, reason: 'shift_not_holiday' }

    case ApplyCondition.IRRENUNCIABLE_ONLY:
      return context.dayType === DayType.IRRENUNCIABLE
        ? { applies: true }
        : { applies: false, reason: 'shift_not_irrenunciable' }

    case ApplyCondition.OVERTIME_ONLY:
      return context.overtimeMinutes > 0
        ? { applies: true }
        : { applies: false, reason: 'no_overtime' }

    case ApplyCondition.SPECIFIC_AREA:
      return conditionValue && context.areaId === conditionValue
        ? { applies: true }
        : { applies: false, reason: 'area_mismatch' }

    case ApplyCondition.SPECIFIC_SHIFT_TYPE:
      return applicableShiftTypeIds.includes(context.shiftTypeId)
        ? { applies: true }
        : { applies: false, reason: 'shift_type_mismatch' }

    case ApplyCondition.CUSTOM_RULE:
      return { applies: true }

    default:
      return { applies: false, reason: 'unknown_condition' }
  }
}
