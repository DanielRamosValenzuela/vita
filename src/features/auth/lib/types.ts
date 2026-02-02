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

export type RegisterInput = {
  name: string
  email: string
  docNumber: string
  password: string
  confirmPassword: string
  country: string
  docType: string
}

export type LoginInput = {
  email: string
  password: string
}
