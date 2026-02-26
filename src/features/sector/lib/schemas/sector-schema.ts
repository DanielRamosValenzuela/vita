import { z } from 'zod'

export interface SectorValidationMessages {
  name: {
    minLength: (min: number) => string
    maxLength: (max: number) => string
  }
  description: {
    maxLength: (max: number) => string
  }
}

export function createSectorSchema(messages: SectorValidationMessages) {
  return z.object({
    name: z.string().min(2, messages.name.minLength(2)).max(100, messages.name.maxLength(100)),
    description: z
      .string()
      .max(500, messages.description.maxLength(500))
      .optional()
      .or(z.literal('')),
    icon: z.string().optional(),
    color: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/)
      .optional(),
  })
}

export function createUpdateSectorSchema(messages: SectorValidationMessages) {
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
    color: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/)
      .optional(),
  })
}
