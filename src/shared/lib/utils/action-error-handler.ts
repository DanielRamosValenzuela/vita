import { z } from 'zod'

import type { ActionResult } from '@/src/shared/lib/types'

function isZodError(error: unknown): error is z.ZodError {
  return error instanceof z.ZodError
}

function isRedirectError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) return false
  const e = error as Error & { digest?: string }
  return (
    e.message === 'NEXT_REDIRECT' ||
    (typeof e.digest === 'string' && e.digest.startsWith('NEXT_REDIRECT'))
  )
}

export function handleActionError<T>(
  error: unknown,
  actionName: string,
  defaultMessage: string
): ActionResult<T> {
  if (isRedirectError(error)) throw error

  console.error(`[${actionName}] Error:`, error)

  if (isZodError(error)) return { success: false, error: 'Datos inválidos' }

  return {
    success: false,
    error: error instanceof Error ? error.message : defaultMessage,
  }
}
