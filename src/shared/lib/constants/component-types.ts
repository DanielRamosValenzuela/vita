import { ComponentType, ComponentUnit, ApplyCondition } from '@prisma/client'

export const COMPONENT_TYPES = {
  BASE_SALARY: 'BASE_SALARY' as ComponentType,
  PER_MINUTE: 'PER_MINUTE' as ComponentType,
  PER_HOUR: 'PER_HOUR' as ComponentType,
  PER_SHIFT: 'PER_SHIFT' as ComponentType,
  SHIFT_COMPLETION_BONUS: 'SHIFT_COMPLETION_BONUS' as ComponentType,
  NIGHT_SHIFT_BONUS: 'NIGHT_SHIFT_BONUS' as ComponentType,
  WEEKEND_BONUS: 'WEEKEND_BONUS' as ComponentType,
  HOLIDAY_BONUS: 'HOLIDAY_BONUS' as ComponentType,
  WEEKEND_MULTIPLIER: 'WEEKEND_MULTIPLIER' as ComponentType,
  HOLIDAY_MULTIPLIER: 'HOLIDAY_MULTIPLIER' as ComponentType,
  IRRENUNCIABLE_MULTIPLIER: 'IRRENUNCIABLE_MULTIPLIER' as ComponentType,
  NIGHT_MULTIPLIER: 'NIGHT_MULTIPLIER' as ComponentType,
  OVERTIME_MULTIPLIER: 'OVERTIME_MULTIPLIER' as ComponentType,
  SENIORITY_BONUS: 'SENIORITY_BONUS' as ComponentType,
  PERFORMANCE_BONUS: 'PERFORMANCE_BONUS' as ComponentType,
  AREA_BONUS: 'AREA_BONUS' as ComponentType,
  EMERGENCY_BONUS: 'EMERGENCY_BONUS' as ComponentType,
  ON_CALL_BONUS: 'ON_CALL_BONUS' as ComponentType,
  CUSTOM: 'CUSTOM' as ComponentType,
} as const

export const COMPONENT_UNITS = {
  MONTHLY: 'MONTHLY' as ComponentUnit,
  BIWEEKLY: 'BIWEEKLY' as ComponentUnit,
  WEEKLY: 'WEEKLY' as ComponentUnit,
  DAILY: 'DAILY' as ComponentUnit,
  PER_SHIFT: 'PER_SHIFT' as ComponentUnit,
  PER_MINUTE: 'PER_MINUTE' as ComponentUnit,
  PER_HOUR: 'PER_HOUR' as ComponentUnit,
  PERCENTAGE: 'PERCENTAGE' as ComponentUnit,
  MULTIPLIER: 'MULTIPLIER' as ComponentUnit,
  FIXED_AMOUNT: 'FIXED_AMOUNT' as ComponentUnit,
} as const

export const APPLY_CONDITIONS = {
  ALWAYS: 'ALWAYS' as ApplyCondition,
  WEEKDAY_ONLY: 'WEEKDAY_ONLY' as ApplyCondition,
  WEEKEND_ONLY: 'WEEKEND_ONLY' as ApplyCondition,
  SATURDAY_ONLY: 'SATURDAY_ONLY' as ApplyCondition,
  SUNDAY_ONLY: 'SUNDAY_ONLY' as ApplyCondition,
  HOLIDAY_ONLY: 'HOLIDAY_ONLY' as ApplyCondition,
  IRRENUNCIABLE_ONLY: 'IRRENUNCIABLE_ONLY' as ApplyCondition,
  NIGHT_SHIFT_ONLY: 'NIGHT_SHIFT_ONLY' as ApplyCondition,
  DAY_SHIFT_ONLY: 'DAY_SHIFT_ONLY' as ApplyCondition,
  OVERTIME_ONLY: 'OVERTIME_ONLY' as ApplyCondition,
  SPECIFIC_AREA: 'SPECIFIC_AREA' as ApplyCondition,
  SPECIFIC_SHIFT_TYPE: 'SPECIFIC_SHIFT_TYPE' as ApplyCondition,
  CUSTOM_RULE: 'CUSTOM_RULE' as ApplyCondition,
} as const

export { ComponentType, ComponentUnit, ApplyCondition }
