import { z } from 'zod'

export const updatePersonalInfoSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[+]?[0-9\s()-]*$/.test(val),
      'El teléfono solo puede contener números, espacios, paréntesis, guiones y el símbolo +'
    ),
  address: z.string().optional(),
  additionalInfo: z.string().optional(),
  birthDate: z.date().optional().nullable(),
})

export type UpdatePersonalInfoInput = z.infer<typeof updatePersonalInfoSchema>
