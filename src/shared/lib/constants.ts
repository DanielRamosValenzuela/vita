import { z } from 'zod'

export const CountryEnum = z.enum(['CL', 'AR', 'PE', 'CO', 'MX', 'US'])

export * from './constants/roles'
export * from './constants/invitation-status'
