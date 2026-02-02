export interface ActionResult<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
  fieldErrors?: Record<string, string[]>
}
