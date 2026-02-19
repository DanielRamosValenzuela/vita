import type { Currency } from '@prisma/client'
import type { FactoryArg } from 'imask'

export function getCurrencyMask(currency: Currency, _showSymbol = false): FactoryArg {
  const configs: Record<
    Currency,
    { thousandsSeparator: string; radix: string; scale: number; symbol: string }
  > = {
    CLP: { thousandsSeparator: '.', radix: ',', scale: 0, symbol: '$' },
    USD: { thousandsSeparator: ',', radix: '.', scale: 2, symbol: '$' },
    COP: { thousandsSeparator: '.', radix: ',', scale: 0, symbol: '$' },
    ARS: { thousandsSeparator: '.', radix: ',', scale: 0, symbol: '$' },
    MXN: { thousandsSeparator: ',', radix: '.', scale: 2, symbol: '$' },
    PEN: { thousandsSeparator: ',', radix: '.', scale: 2, symbol: 'S/' },
    EUR: { thousandsSeparator: '.', radix: ',', scale: 2, symbol: '€' },
  }

  const config = configs[currency]

  const mask: FactoryArg = {
    mask: Number,
    thousandsSeparator: config.thousandsSeparator,
    radix: config.radix,
    scale: config.scale,
    padFractionalZeros: config.scale > 0,
    normalizeZeros: true,
    mapToRadix: ['.', ','],
    min: 0,
  }

  return mask
}
