import type {
  ApplyCondition,
  ComponentType,
  ComponentUnit,
  Currency,
  DayType,
  PaymentStatus,
} from '@prisma/client'



export interface ComponentEvaluationContext {
  dayType: DayType
  shiftTypeId: string
  areaId: string
  isExtra: boolean
  classification: 'DAY' | 'NIGHT' | 'MIXED'
}



export interface ComponentBreakdown {
  componentId: string
  componentName: string
  componentType: ComponentType
  baseValue: number
  calculatedValue: number
  appliedMinutes: number | null
}

export interface ShiftPaymentResult {
  paymentId: string
  shiftId: string
  baseAmount: number
  calendarMultiplier: number
  finalAmount: number
  minutesWorked: number
  isPartialCompletion: boolean
  breakdowns: ComponentBreakdown[]
}



export interface ContractPeriodInfo {
  contractId: string
  rateTemplateId: string
  rateTemplateName: string
  areaId: string | null
  areaName: string | null
  customMultiplier: number | null
  daysInPeriod: number
  totalDaysInPeriod: number
  startDate: Date
  endDate: Date | null
}

export interface ShiftPaymentSummary {
  shiftId: string
  date: Date
  areaName: string
  shiftTypeName: string
  minutesWorked: number
  finalAmount: number
  status: PaymentStatus
  isEstimated: boolean
  calendarMultiplier: number
  dayType: DayType
  breakdowns: ComponentBreakdown[]
}

export interface MonthlyComponentSummary {
  componentId: string
  componentName: string
  componentType: ComponentType
  unit: ComponentUnit
  applyCondition: ApplyCondition
  baseValue: number
  proratedValue: number
  contractDays: number
  totalDays: number
}

export interface PayrollCalculationResult {
  userId: string
  userName: string
  userEmail: string
  organizationId: string
  month: number
  year: number
  currency: Currency
  contracts: ContractPeriodInfo[]
  baseSalaryAmount: number
  shiftsAmount: number
  monthlyComponentsAmount: number
  totalAmount: number
  shiftsCount: number
  contractDaysInPeriod: number
  totalDaysInPeriod: number
  shifts: ShiftPaymentSummary[]
  monthlyComponents: MonthlyComponentSummary[]
}
