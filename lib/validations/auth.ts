import { z } from 'zod'
import { validateRUT } from './rut'
import { Country, DocType } from '@prisma/client'

const rutSchema = z
  .string()
  .min(8, 'El RUT debe tener al menos 8 caracteres')
  .max(12, 'El RUT no puede exceder 12 caracteres')
  .refine((rut) => validateRUT(rut), {
    message: 'El RUT ingresado no es válido',
  })

const emailSchema = z
  .string()
  .min(1, 'El email es requerido')
  .email('El email no es válido')
  .toLowerCase()
  .trim()

const passwordSchema = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .max(100, 'La contraseña no puede exceder 100 caracteres')
  .regex(/[A-Z]/, 'La contraseña debe contener al menos una mayúscula')
  .regex(/[a-z]/, 'La contraseña debe contener al menos una minúscula')
  .regex(/[0-9]/, 'La contraseña debe contener al menos un número')

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, 'El nombre debe tener al menos 2 caracteres')
      .max(100, 'El nombre no puede exceder 100 caracteres')
      .trim(),
    email: emailSchema,
    rut: rutSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Debes confirmar tu contraseña'),
    country: z.nativeEnum(Country).default(Country.CL),
    docType: z.nativeEnum(DocType).default(DocType.RUT),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'La contraseña es requerida'),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>

