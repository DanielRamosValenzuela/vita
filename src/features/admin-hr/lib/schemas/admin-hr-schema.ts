import { z } from 'zod'

export interface AreaValidationMessages {
  name: {
    minLength: (min: number) => string
    maxLength: (max: number) => string
  }
  description: {
    maxLength: (max: number) => string
  }
}

export function createAreaSchema(messages: AreaValidationMessages) {
  return z.object({
    name: z.string().min(2, messages.name.minLength(2)).max(100, messages.name.maxLength(100)),
    description: z
      .string()
      .max(500, messages.description.maxLength(500))
      .optional()
      .or(z.literal('')),
    isActive: z.boolean(),
  })
}

export function createUpdateAreaSchema(messages: AreaValidationMessages) {
  return z.object({
    name: z
      .string()
      .min(2, messages.name.minLength(2))
      .max(100, messages.name.maxLength(100))
      .optional(),
    description: z
      .string()
      .max(500, messages.description.maxLength(500))
      .optional()
      .or(z.literal('')),
    isActive: z.boolean().optional(),
  })
}
