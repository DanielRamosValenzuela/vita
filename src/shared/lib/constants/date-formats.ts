import { Country } from '@prisma/client'
import type { Locale } from 'date-fns'
import { enUS, es } from 'date-fns/locale'

const COUNTRY_DATE_FORMATS: Record<Country, string> = {
  CL: 'dd/MM/yyyy',
  PE: 'dd/MM/yyyy',
  CO: 'dd/MM/yyyy',
  AR: 'dd/MM/yyyy',
  MX: 'dd/MM/yyyy',
  US: 'MM/dd/yyyy',
}

const COUNTRY_DATE_TIME_FORMATS: Record<Country, string> = {
  CL: 'dd/MM/yyyy HH:mm',
  PE: 'dd/MM/yyyy HH:mm',
  CO: 'dd/MM/yyyy HH:mm',
  AR: 'dd/MM/yyyy HH:mm',
  MX: 'dd/MM/yyyy HH:mm',
  US: 'MM/dd/yyyy hh:mm a',
}

const COUNTRY_LOCALES: Record<Country, Locale> = {
  CL: es,
  PE: es,
  CO: es,
  AR: es,
  MX: es,
  US: enUS,
}

export function getDateFormatByCountry(country: Country): string {
  return COUNTRY_DATE_FORMATS[country] || 'dd/MM/yyyy'
}

export function getDateTimeFormatByCountry(country: Country): string {
  return COUNTRY_DATE_TIME_FORMATS[country] || 'dd/MM/yyyy HH:mm'
}

export function getLocaleByCountry(country: Country): Locale {
  return COUNTRY_LOCALES[country] || es
}

