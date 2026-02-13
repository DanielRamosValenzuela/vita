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
    icon: z.string().optional(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    isActive: z.boolean(),
    dayStartTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/)
      .optional()
      .or(z.literal('')),
    dayEndTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/)
      .optional()
      .or(z.literal('')),
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
    icon: z.string().optional(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    isActive: z.boolean().optional(),
    maxConsecutiveHours: z.number().int().min(1).max(168).nullable().optional(),
    minRestHours: z.number().int().min(0).max(72).nullable().optional(),
    dayStartTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/)
      .nullable()
      .optional()
      .or(z.literal('')),
    dayEndTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/)
      .nullable()
      .optional()
      .or(z.literal('')),
  })
}
