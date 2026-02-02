import { z } from 'zod'

import type { ActionResult } from '@/src/shared/lib/types'

export function isZodError(error: unknown): error is z.ZodError {
  return error instanceof z.ZodError
}

export function handleActionError<T>(
  error: unknown,
  actionName: string,
  defaultMessage: string
): ActionResult<T> {
  console.error(`[${actionName}] Error:`, error)

  if (isZodError(error))
    return { success: false, error: 'Datos inválidos' }

  return {
    success: false,
    error: error instanceof Error ? error.message : defaultMessage,
  }
}
