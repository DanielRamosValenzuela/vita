import { toast } from 'sonner'

import type { ActionResult } from '@/src/shared/lib/types'

export function toastActionResult<T>(
  result: ActionResult<T>,
  options?: { successMessage?: string; errorMessage?: string }
): ActionResult<T> {
  if (result.success)
    toast.success(result.message ?? options?.successMessage ?? 'Éxito')
  else
    toast.error(result.error ?? options?.errorMessage ?? 'Error')

  return result
}
