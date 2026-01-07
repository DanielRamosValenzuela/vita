import { Country } from '@prisma/client'

export interface TaxIdConfig {
  label: string
  placeholder: string
  description: string
  minLength: number
  maxLength: number
  pattern?: RegExp
  formatFunction?: (value: string) => string
  validateFunction?: (value: string) => boolean
}

export const TAX_ID_CONFIG: Record<Country, TaxIdConfig> = {
  CL: {
    label: 'RUT',
    placeholder: '77.888.999-7',
    description: 'Rol Único Tributario (RUT) de la empresa',
    minLength: 8,
    maxLength: 12,
    pattern: /^[0-9]{1,2}\.[0-9]{3}\.[0-9]{3}-[0-9Kk]$/,
    formatFunction: (value: string) => {
      const cleaned = value.replace(/[^0-9Kk]/gi, '')
      if (cleaned.length === 0) return ''

      const rut = cleaned.slice(0, -1)
      const dv = cleaned.slice(-1).toUpperCase()

      if (rut.length === 0) return dv

      const formatted = rut.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
      return `${formatted}-${dv}`
    },
    validateFunction: (value: string) => {
      const cleaned = value.replace(/[^0-9Kk]/gi, '')
      if (cleaned.length < 8 || cleaned.length > 9) return false

      const rut = cleaned.slice(0, -1)
      const dv = cleaned.slice(-1).toUpperCase()

      let sum = 0
      let multiplier = 2

      for (let i = rut.length - 1; i >= 0; i--) {
        sum += parseInt(rut[i]) * multiplier
        multiplier = multiplier === 7 ? 2 : multiplier + 1
      }

      const expectedDv = 11 - (sum % 11)
      const finalDv = expectedDv === 11 ? '0' : expectedDv === 10 ? 'K' : expectedDv.toString()

      return dv === finalDv
    },
  },
  PE: {
    label: 'RUC',
    placeholder: '20123456789',
    description: 'Registro Único de Contribuyentes (RUC)',
    minLength: 11,
    maxLength: 11,
    pattern: /^[12][0-9]{10}$/,
    formatFunction: (value: string) => {
      return value.replace(/[^0-9]/g, '').slice(0, 11)
    },
    validateFunction: (value: string) => {
      const cleaned = value.replace(/[^0-9]/g, '')
      if (cleaned.length !== 11) return false
      if (!cleaned.startsWith('1') && !cleaned.startsWith('2')) return false
      return true
    },
  },
  CO: {
    label: 'NIT',
    placeholder: '900123456-7',
    description: 'Número de Identificación Tributaria (NIT)',
    minLength: 9,
    maxLength: 12,
    pattern: /^[0-9]{6,9}-[0-9]$/,
    formatFunction: (value: string) => {
      const cleaned = value.replace(/[^0-9]/g, '')
      if (cleaned.length === 0) return ''
      if (cleaned.length === 1) return cleaned

      const nit = cleaned.slice(0, -1)
      const dv = cleaned.slice(-1)

      return `${nit}-${dv}`
    },
    validateFunction: (value: string) => {
      const cleaned = value.replace(/[^0-9]/g, '')
      if (cleaned.length < 9 || cleaned.length > 10) return false

      const nit = cleaned.slice(0, -1)
      const dv = cleaned.slice(-1)

      const primes = [3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71]
      let sum = 0

      for (let i = 0; i < nit.length; i++) {
        sum += parseInt(nit[nit.length - 1 - i]) * primes[i]
      }

      const remainder = sum % 11
      const expectedDv = remainder > 1 ? 11 - remainder : remainder

      return parseInt(dv) === expectedDv
    },
  },
  AR: {
    label: 'CUIT',
    placeholder: '30-12345678-9',
    description: 'Clave Única de Identificación Tributaria (CUIT)',
    minLength: 11,
    maxLength: 13,
    pattern: /^[0-9]{2}-[0-9]{8}-[0-9]$/,
    formatFunction: (value: string) => {
      const cleaned = value.replace(/[^0-9]/g, '')
      if (cleaned.length === 0) return ''
      if (cleaned.length <= 2) return cleaned
      if (cleaned.length <= 10) {
        return `${cleaned.slice(0, 2)}-${cleaned.slice(2)}`
      }

      return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 10)}-${cleaned.slice(10, 11)}`
    },
    validateFunction: (value: string) => {
      const cleaned = value.replace(/[^0-9]/g, '')
      if (cleaned.length !== 11) return false

      const multipliers = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2]
      let sum = 0

      for (let i = 0; i < 10; i++) {
        sum += parseInt(cleaned[i]) * multipliers[i]
      }

      const remainder = sum % 11
      const expectedDv = remainder === 0 ? 0 : remainder === 1 ? 9 : 11 - remainder

      return parseInt(cleaned[10]) === expectedDv
    },
  },
  MX: {
    label: 'RFC',
    placeholder: 'ABC123456XYZ',
    description: 'Registro Federal de Contribuyentes (RFC)',
    minLength: 12,
    maxLength: 13,
    pattern: /^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/,
    formatFunction: (value: string) => {
      return value
        .toUpperCase()
        .replace(/[^A-ZÑ&0-9]/g, '')
        .slice(0, 13)
    },
    validateFunction: (value: string) => {
      const cleaned = value.toUpperCase().replace(/[^A-ZÑ&0-9]/g, '')
      if (cleaned.length !== 12 && cleaned.length !== 13) return false

      const lettersPart = cleaned.slice(0, cleaned.length === 13 ? 4 : 3)
      const datePart = cleaned.slice(cleaned.length === 13 ? 4 : 3, cleaned.length === 13 ? 10 : 9)
      const homoclavePart = cleaned.slice(cleaned.length === 13 ? 10 : 9)

      if (!/^[A-ZÑ&]+$/.test(lettersPart)) return false
      if (!/^[0-9]{6}$/.test(datePart)) return false
      if (!/^[A-Z0-9]{3}$/.test(homoclavePart)) return false

      return true
    },
  },
  US: {
    label: 'EIN',
    placeholder: '12-3456789',
    description: 'Employer Identification Number (EIN)',
    minLength: 9,
    maxLength: 10,
    pattern: /^[0-9]{2}-[0-9]{7}$/,
    formatFunction: (value: string) => {
      const cleaned = value.replace(/[^0-9]/g, '')
      if (cleaned.length === 0) return ''
      if (cleaned.length <= 2) return cleaned

      return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 9)}`
    },
    validateFunction: (value: string) => {
      const cleaned = value.replace(/[^0-9]/g, '')
      return cleaned.length === 9
    },
  },
}

export const getTaxIdConfig = (country: Country): TaxIdConfig => {
  return TAX_ID_CONFIG[country]
}

export const formatTaxId = (value: string, country: Country): string => {
  const config = getTaxIdConfig(country)
  if (config.formatFunction) {
    return config.formatFunction(value)
  }
  return value
}

export const validateTaxId = (value: string, country: Country): boolean => {
  const config = getTaxIdConfig(country)
  if (config.validateFunction) {
    return config.validateFunction(value)
  }

  const cleaned = value.replace(/[^a-zA-Z0-9]/g, '')
  return cleaned.length >= config.minLength && cleaned.length <= config.maxLength
}
