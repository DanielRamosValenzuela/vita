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

export function formatDateLong(date: Date, locale: 'es' | 'en' = 'es'): string {
  return formatDateFns(date, 'PPP', { locale: DATE_LOCALES[locale] })
}

export function formatDateShort(date: Date, locale: 'es' | 'en' = 'es'): string {
  return formatDateFns(date, locale === 'es' ? 'dd/MM/yyyy' : 'MM/dd/yyyy', {
    locale: DATE_LOCALES[locale],
  })
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

export function formatShortDate(date: Date | string, options?: { weekday?: boolean }): string {
  const d = new Date(date)
  return d.toLocaleDateString([], {
    ...(options?.weekday && { weekday: 'short' }),
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleString([], {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDateTimeCL(date: Date): string {
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function formatCurrencyByCode(amount: number, currency: string): string {
  if (currency === 'CLP') return `$${Math.round(amount).toLocaleString('es-CL')}`

  if (currency === 'UF') return `${amount.toFixed(4)} UF`

  return `$${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
}
