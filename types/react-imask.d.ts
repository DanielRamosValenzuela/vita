declare module 'react-imask' {
  import * as React from 'react'

  export interface IMaskInputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    mask?: unknown
    inputRef?: React.Ref<HTMLInputElement>
    onAccept?: (value: string, mask: { unmaskedValue: string }) => void
  }

  export const IMaskInput: React.ComponentType<IMaskInputProps>
}

