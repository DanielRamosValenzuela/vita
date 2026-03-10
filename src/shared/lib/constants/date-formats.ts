import { Country } from '@prisma/client'
import type { Locale } from 'date-fns'
import { enUS, es } from 'date-fns/locale'

const COUNTRY_LOCALES: Record<Country, Locale> = {
  CL: es,
  PE: es,
  CO: es,
  AR: es,
  MX: es,
  US: enUS,
}

export function getLocaleByCountry(country: Country): Locale {
  return COUNTRY_LOCALES[country] || es
}

export const MONTH_NAMES_ES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
] as const
