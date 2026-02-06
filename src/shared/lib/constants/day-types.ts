import { DayType } from '@prisma/client'

export const DAY_TYPES = {
  NORMAL: 'NORMAL' as DayType,
  WEEKEND: 'WEEKEND' as DayType,
  SATURDAY: 'SATURDAY' as DayType,
  SUNDAY: 'SUNDAY' as DayType,
  HOLIDAY: 'HOLIDAY' as DayType,
  IRRENUNCIABLE: 'IRRENUNCIABLE' as DayType,
  ORGANIZATION_HOLIDAY: 'ORGANIZATION_HOLIDAY' as DayType,
  CUSTOM: 'CUSTOM' as DayType,
} as const

export function getDayTypeColor(type: DayType): string {
  switch (type) {
    case DAY_TYPES.NORMAL:
      return 'bg-background'
    case DAY_TYPES.WEEKEND:
    case DAY_TYPES.SATURDAY:
    case DAY_TYPES.SUNDAY:
      return 'bg-blue-50 dark:bg-blue-950/30'
    case DAY_TYPES.HOLIDAY:
      return 'bg-green-50 dark:bg-green-950/30'
    case DAY_TYPES.IRRENUNCIABLE:
      return 'bg-red-50 dark:bg-red-950/30'
    case DAY_TYPES.ORGANIZATION_HOLIDAY:
      return 'bg-purple-50 dark:bg-purple-950/30'
    case DAY_TYPES.CUSTOM:
      return 'bg-yellow-50 dark:bg-yellow-950/30'
    default:
      return 'bg-background'
  }
}

export { DayType }
