import { format as formatDateFns } from 'date-fns'
import { enUS, es } from 'date-fns/locale'
import type { Country, Currency } from '@prisma/client'

const DATE_LOCALES = { es, en: enUS } as const

export function formatDate(
  date: Date,
  locale: 'es' | 'en' = 'es',
  pattern: string = 'dd MMM yyyy'
): string {
  return formatDateFns(date, pattern, { locale: DATE_LOCALES[locale] })
}

const CURRENCY_LOCALES: Record<Currency, string> = {
  CLP: 'es-CL',
  USD: 'en-US',
  COP: 'es-CO',
  ARS: 'es-AR',
  MXN: 'es-MX',
  PEN: 'es-PE',
  EUR: 'es-ES',
}

const COUNTRY_CURRENCIES: Record<Country, Currency> = {
  CL: 'CLP',
  US: 'USD',
  CO: 'COP',
  AR: 'ARS',
  MX: 'MXN',
  PE: 'PEN',
}

export interface FormatCurrencyOptions {
  showCurrency?: boolean
  showSymbol?: boolean
  decimals?: number
  compact?: boolean
}

export function formatCurrencyByCountry(
  amount: number,
  country: Country,
  options: FormatCurrencyOptions = {}
): string {
  const {
    showCurrency = false,
    showSymbol = true,
    decimals = 0,
    compact = false,
  } = options

  const currency = COUNTRY_CURRENCIES[country] || 'USD'
  const locale = CURRENCY_LOCALES[currency]

  const formatter = new Intl.NumberFormat(locale, {
    style: showSymbol ? 'currency' : 'decimal',
    currency: showSymbol ? currency : undefined,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    notation: compact ? 'compact' : 'standard',
    useGrouping: true,
  })

  const formatted = formatter.format(amount)

  if (showCurrency && !showSymbol)
    return `${formatted} ${currency}`

  return formatted
}

export function formatCurrencyByCurrency(
  amount: number,
  currency: Currency,
  options: FormatCurrencyOptions = {}
): string {
  const {
    showCurrency = false,
    showSymbol = true,
    decimals = 0,
    compact = false,
  } = options

  const locale = CURRENCY_LOCALES[currency]

  const formatter = new Intl.NumberFormat(locale, {
    style: showSymbol ? 'currency' : 'decimal',
    currency: showSymbol ? currency : undefined,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    notation: compact ? 'compact' : 'standard',
    useGrouping: true,
  })

  const formatted = formatter.format(amount)

  if (showCurrency && !showSymbol)
    return `${formatted} ${currency}`

  return formatted
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

export function parseCurrencyInput(value: string): number {
  const cleanValue = value.replace(/[^0-9.,]/g, '')
  const normalized = cleanValue.replace(/\./g, '').replace(',', '.')
  return parseFloat(normalized) || 0
}
