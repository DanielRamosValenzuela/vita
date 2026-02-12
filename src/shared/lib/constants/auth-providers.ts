export const AUTH_PROVIDERS = {
  CREDENTIALS: 'credentials',
  GOOGLE: 'google',
} as const

export type AuthProviderId = (typeof AUTH_PROVIDERS)[keyof typeof AUTH_PROVIDERS]

