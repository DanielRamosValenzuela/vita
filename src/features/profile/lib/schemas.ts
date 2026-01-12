import { z } from 'zod'
import { Country } from '@prisma/client'
import { validateTaxId } from '@/src/shared/lib/utils/tax-id-config'

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .trim(),
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('El email no es válido')
    .toLowerCase()
    .trim(),
})

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
    newPassword: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .max(100, 'La contraseña no puede exceder 100 caracteres')
      .regex(/[A-Z]/, 'La contraseña debe contener al menos una mayúscula')
      .regex(/[a-z]/, 'La contraseña debe contener al menos una minúscula')
      .regex(/[0-9]/, 'La contraseña debe contener al menos un número'),
    confirmPassword: z.string().min(1, 'Debes confirmar tu contraseña'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

export const updateDocumentSchema = (country: Country) =>
  z.object({
    country: z.nativeEnum(Country),
    docNumber: z
      .string()
      .min(1, 'El número de documento es requerido')
      .refine((val) => validateTaxId(val, country), {
        message: 'Número de documento inválido para el país seleccionado',
      }),
  })

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
export type UpdateDocumentInput = z.infer<ReturnType<typeof updateDocumentSchema>>
