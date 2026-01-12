import { z } from 'zod'
import { CountryEnum } from './schemas'

export const createAdminHRUserSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(100, 'La contraseña no puede exceder 100 caracteres'),
  country: CountryEnum.optional(),
  docType: z
    .enum([
      'RUT',
      'CC',
      'CE',
      'TI',
      'DNI',
      'CARNET_EXT',
      'DNI_AR',
      'CUIL',
      'CUIT',
      'CURP',
      'RFC',
      'PASSPORT',
    ])
    .optional(),
  docNumber: z.string().optional(),
  organizationId: z.string().min(1, 'La organización es obligatoria'),
})

export const updateAdminHRUserSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .optional(),
  email: z.string().email('Email inválido').optional(),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(100, 'La contraseña no puede exceder 100 caracteres')
    .optional(),
  organizationId: z.string().min(1, 'La organización es obligatoria').optional(),
})

export type CreateAdminHRUserInput = z.infer<typeof createAdminHRUserSchema>
export type UpdateAdminHRUserInput = z.infer<typeof updateAdminHRUserSchema>
