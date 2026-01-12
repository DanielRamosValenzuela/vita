import { z } from 'zod'

export const createAreaSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  description: z
    .string()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .optional()
    .or(z.literal('')),
  isActive: z.boolean(),
})

export const updateAreaSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .optional(),
  description: z
    .string()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .optional()
    .or(z.literal('')),
  isActive: z.boolean().optional(),
})

export type CreateAreaInput = z.infer<typeof createAreaSchema>
export type UpdateAreaInput = z.infer<typeof updateAreaSchema>
