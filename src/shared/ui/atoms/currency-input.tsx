'use client'

import { forwardRef, useState, useEffect } from 'react'
import type { Currency } from '@prisma/client'

import { Input } from '../input'
import { formatCurrencyByCurrency, parseCurrencyInput } from '../../lib/utils/format'
import { cn } from '../../lib/utils'

export interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  currency: Currency
  value?: number
  onChange?: (value: number) => void
  allowDecimals?: boolean
  showSymbol?: boolean
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ currency, value = 0, onChange, allowDecimals = false, showSymbol = false, className, ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState('')
    const [isFocused, setIsFocused] = useState(false)

    useEffect(() => {
      if (!isFocused)
        if (value === 0)
          setDisplayValue('')
        else {
          const formatted = formatCurrencyByCurrency(value, currency, {
            decimals: allowDecimals ? 2 : 0,
            showSymbol: false,
          })
          setDisplayValue(formatted)
        }
    }, [value, currency, allowDecimals, isFocused])

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      const inputValue = e.target.value

      const cleanValue = inputValue.replace(/[^0-9.,]/g, '')

      setDisplayValue(cleanValue)

      const numericValue = parseCurrencyInput(cleanValue)
      onChange?.(numericValue)
    }

    function handleFocus() {
      setIsFocused(true)
      if (value === 0)
        setDisplayValue('')
      else {
        const formatted = formatCurrencyByCurrency(value, currency, {
          decimals: allowDecimals ? 2 : 0,
          showSymbol: false,
        })
        setDisplayValue(formatted)
      }
    }

    function handleBlur() {
      setIsFocused(false)
      if (displayValue === '' || displayValue === '0') {
        onChange?.(0)
        setDisplayValue('')
      } else {
        const numericValue = parseCurrencyInput(displayValue)
        onChange?.(numericValue)
        const formatted = formatCurrencyByCurrency(numericValue, currency, {
          decimals: allowDecimals ? 2 : 0,
          showSymbol: false,
        })
        setDisplayValue(formatted)
      }
    }

    const prefix = showSymbol ? getCurrencySymbol(currency) : ''

    return (
      <div className="relative">
        {showSymbol && prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {prefix}
          </span>
        )}
        <Input
          ref={ref}
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={cn(showSymbol && prefix && 'pl-8', className)}
          {...props}
        />
      </div>
    )
  }
)

CurrencyInput.displayName = 'CurrencyInput'

function getCurrencySymbol(currency: Currency): string {
  const symbols: Record<Currency, string> = {
    CLP: '$',
    USD: '$',
    COP: '$',
    ARS: '$',
    MXN: '$',
    PEN: 'S/',
    EUR: '€',
  }
  return symbols[currency] || '$'
}
