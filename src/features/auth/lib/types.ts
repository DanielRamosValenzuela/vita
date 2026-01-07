export interface ActionResult<T = unknown> {
  success: boolean
  data?: T
  error?: string
  fieldErrors?: Record<string, string[]>
}

export interface RegisterData {
  email: string
  name: string
}

export interface LoginData {
  user: {
    id: string
    email: string
    name: string
    role: string
  }
}
