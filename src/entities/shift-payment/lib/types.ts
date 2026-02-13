import type {
  ApplyCondition,
  ComponentType,
  ComponentUnit,
  Currency,
  DayType,
  ShiftClassification,
} from '@prisma/client'

export interface PaymentComponent {
  id: string
  type: ComponentType
  customName: string | null
  value: number
  unit: ComponentUnit
  applyCondition: ApplyCondition
  conditionValue: string | null
  order: number
  applicableShiftTypeIds: string[]
}

export interface PaymentCalculationInput {
  shift: {
    id: string
    startTime: Date
    endTime: Date
    actualStartTime: Date | null
    actualEndTime: Date | null
    shiftTypeId: string
    areaId: string
  }
  shiftType: {
    id: string
    classification: ShiftClassification
    durationMinutes: number
  }
  contract: {
    id: string
    customMultiplier: number | null
  }
  components: PaymentComponent[]
  calendarDay: {
    type: DayType
    multiplier: number
  } | null
  currency: Currency
}

export interface ShiftContext {
  shiftTypeId: string
  areaId: string
  classification: ShiftClassification
  scheduledMinutes: number
  actualMinutes: number
  overtimeMinutes: number
  isPartialCompletion: boolean
  dayType: DayType
  dayOfWeek: number
}

export interface ComponentCalculation {
  componentId: string
  componentName: string
  componentType: ComponentType
  baseValue: number
  calculatedValue: number
  appliedMinutes: number | null
  notes: string | null
  skipped: boolean
  skipReason: string | null
}

export interface PaymentCalculationOutput {
  baseAmount: number
  totalAmount: number
  calendarMultiplier: number
  finalAmount: number
  minutesWorked: number
  isPartialCompletion: boolean
  breakdowns: ComponentCalculation[]
  contractId: string
}

export interface ConditionResult {
  applies: boolean
  reason?: string
}
