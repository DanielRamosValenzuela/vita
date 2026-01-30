import { format as formatDateFns } from 'date-fns'
import { enUS, es } from 'date-fns/locale'

const DATE_LOCALES = { es, en: enUS } as const

export function formatDate(
  date: Date,
  locale: 'es' | 'en' = 'es',
  pattern: string = 'dd MMM yyyy'
): string {
  return formatDateFns(date, pattern, { locale: DATE_LOCALES[locale] })
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export const formatPercentage = (value: number, total: number): string => {
  if (total === 0) return '0%'
  return `${((value / total) * 100).toFixed(1)}%`
}
