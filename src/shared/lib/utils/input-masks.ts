import type { Currency } from '@prisma/client'
import type { FactoryArg } from 'imask'

export function getCurrencyMask(currency: Currency, showSymbol = false): FactoryArg {
  const configs: Record<Currency, { thousandsSeparator: string; radix: string; scale: number; symbol: string }> = {
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

  if (showSymbol)
    return {
      ...mask,
      mask: `${config.symbol} num`,
      blocks: {
        num: mask,
      },
    }

  return mask
}

export const phoneMask: FactoryArg = {
  mask: '+56 0 0000 0000',
  lazy: false,
}

export const rutMask: FactoryArg = {
  mask: '00.000.000-0',
  lazy: false,
}

export const percentageMask: FactoryArg = {
  mask: Number,
  scale: 2,
  min: 0,
  max: 100,
  radix: '.',
  mapToRadix: ['.', ','],
  thousandsSeparator: ',',
}

export const timeMask: FactoryArg = {
  mask: 'HH:MM',
  blocks: {
    HH: {
      mask: '00',
    },
    MM: {
      mask: '00',
    },
  },
}
