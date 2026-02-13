import { ZodError } from 'zod'

export function formatZodErrors(error: ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {}

  error.issues.forEach((issue) => {
    const path = issue.path.join('.')
    if (!fieldErrors[path]) fieldErrors[path] = []

    fieldErrors[path].push(issue.message)
  })

  return fieldErrors
}
