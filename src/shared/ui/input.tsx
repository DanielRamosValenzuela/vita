import * as React from 'react'
import type { FactoryArg } from 'imask'
import { IMaskInput } from 'react-imask'

import { cn } from '@/src/shared/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  maxDigits?: number
  mask?: FactoryArg
  onMaskAccept?: (value: string, unmaskedValue: string) => void
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, maxDigits, mask, onMaskAccept, onChange, ...props }, ref) => {
    const baseClassName = cn(
      'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm tracking-wide ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
      type === 'color' && 'cursor-pointer',
      className
    )

    if (mask) {
      const maskOpts = mask as Record<string, unknown>
      return (
        <IMaskInput
          {...maskOpts}
          inputRef={ref as React.Ref<HTMLInputElement>}
          className={baseClassName}
          onAccept={(value: string, maskRef: { unmaskedValue: string }) => {
            const unmaskedValue = maskRef.unmaskedValue
            if (onMaskAccept) onMaskAccept(value, unmaskedValue)
            if (onChange) {
              const event = {
                target: { value: unmaskedValue },
              } as React.ChangeEvent<HTMLInputElement>
              onChange(event)
            }
          }}
          {...props}
        />
      )
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (maxDigits && type === 'number') {
        const value = e.target.value
        if (value !== '' && value.length > maxDigits) return
      }

      onChange?.(e)
    }

    return (
      <input type={type} className={baseClassName} ref={ref} onChange={handleChange} {...props} />
    )
  }
)

Input.displayName = 'Input'

export { Input }
