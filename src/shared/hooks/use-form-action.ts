'use client'

import { useCallback, useState, useTransition } from 'react'

import type { ActionResult } from '@/src/shared/lib/types'
import { toastActionResult } from '@/src/shared/lib/utils/toast-action-result'

import { useRouter } from '@/i18n/navigation'

export interface UseFormActionOptions<TData, TInput> {
  action: (input: TInput) => Promise<ActionResult<TData>>
  successMessage?: string
  errorMessage?: string
  redirectTo?: string
  onSuccess?: (data: TData) => void
}

export function useFormAction<TData = unknown, TInput = unknown>(
  options: UseFormActionOptions<TData, TInput>
) {
  const { action, successMessage, errorMessage, redirectTo, onSuccess } = options
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(
    (input: TInput) => {
      setError(null)
      startTransition(async () => {
        const result = await action(input)
        toastActionResult(result, {
          successMessage,
          errorMessage,
        })

        if (result.success) {
          if (onSuccess && result.data !== undefined) onSuccess(result.data)
          if (redirectTo) router.push(redirectTo)
        } else setError(result.error ?? errorMessage ?? 'Error')
      })
    },
    [action, successMessage, errorMessage, redirectTo, onSuccess, router]
  )

  return { execute, isPending, error, setError }
}
