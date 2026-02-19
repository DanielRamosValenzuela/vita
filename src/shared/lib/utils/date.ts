import type { Country } from '@prisma/client'
import { format as dateFnsFormat } from 'date-fns'

import {
  getDateFormatByCountry,
  getDateTimeFormatByCountry,
  getLocaleByCountry,
} from '../constants/date-formats'

interface FormatDateOptions {
  includeTime?: boolean
  customFormat?: string
}

function formatDateByCountry(
  date: Date | string | number,
  country: Country,
  options: FormatDateOptions = {}
): string {
  const { includeTime = false, customFormat } = options
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
  const locale = getLocaleByCountry(country)

  if (customFormat) return dateFnsFormat(dateObj, customFormat, { locale })

  const formatString = includeTime
    ? getDateTimeFormatByCountry(country)
    : getDateFormatByCountry(country)

  return dateFnsFormat(dateObj, formatString, { locale })
}

export function formatDateTimeByCountry(
  date: Date | string | number,
  country: Country,
  customFormat?: string
): string {
  return formatDateByCountry(date, country, { includeTime: true, customFormat })
}
