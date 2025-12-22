import { z } from 'zod'

export function formatZodErrors(error: z.ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {}
  
  error.issues.forEach((err) => {
    const field = err.path[0] as string
    if (!fieldErrors[field]) {
      fieldErrors[field] = []
    }
    fieldErrors[field].push(err.message)
  })
  
  return fieldErrors
}

