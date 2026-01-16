import { Country, DocType } from '@prisma/client'
import { z } from 'zod'

import { getDocTypeForCountry } from '@/src/shared/lib/utils/doc-type-mapper'
import { getTaxIdConfig, validateTaxId } from '@/src/shared/lib/utils/tax-id-config'

export interface ValidationMessages {
  email: {
    required: string
    invalid: string
  }
  password: {
    required: string
    minLength: string
    maxLength: string
    uppercase: string
    lowercase: string
    number: string
  }
  name: {
    required: string
    minLength: string
    maxLength: string
  }
  docNumber: {
    required: string
    minLength: (min: number) => string
    maxLength: (max: number) => string
    invalid: (label: string) => string
  }
  confirmPassword: {
    required: string
    mismatch: string
  }
  docType: {
    mismatch: (expected: string, country: string) => string
  }
}

export function createEmailSchema(messages: ValidationMessages['email']) {
  return z.string().min(1, messages.required).email(messages.invalid).toLowerCase().trim()
}

export function createPasswordSchema(messages: ValidationMessages['password']) {
  return z
    .string()
    .min(8, messages.minLength)
    .max(100, messages.maxLength)
    .regex(/[A-Z]/, messages.uppercase)
    .regex(/[a-z]/, messages.lowercase)
    .regex(/[0-9]/, messages.number)
}

export function createNameSchema(messages: ValidationMessages['name']) {
  return z.string().min(2, messages.minLength).max(100, messages.maxLength).trim()
}

export function createDocNumberSchema(country: Country, messages: ValidationMessages['docNumber']) {
  const config = getTaxIdConfig(country)
  return z
    .string()
    .min(1, messages.required)
    .min(config.minLength, messages.minLength(config.minLength))
    .max(config.maxLength, messages.maxLength(config.maxLength))
    .refine((value) => validateTaxId(value, country), {
      message: messages.invalid(config.label),
    })
}

export function createRegisterSchema(messages: ValidationMessages) {
  return z
    .object({
      name: createNameSchema(messages.name),
      email: createEmailSchema(messages.email),
      docNumber: z.string().min(1, messages.docNumber.required),
      password: createPasswordSchema(messages.password),
      confirmPassword: z.string().min(1, messages.confirmPassword.required),
      country: z.nativeEnum(Country).default(Country.CL),
      docType: z.nativeEnum(DocType).default(DocType.RUT),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: messages.confirmPassword.mismatch,
      path: ['confirmPassword'],
    })
    .superRefine((data, ctx) => {
      const docNumberSchema = createDocNumberSchema(data.country, messages.docNumber)
      const result = docNumberSchema.safeParse(data.docNumber)
      if (!result.success) 
        result.error.issues.forEach((issue) => {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: issue.message,
            path: ['docNumber'],
          })
        })
      

      const expectedDocType = getDocTypeForCountry(data.country)
      if (data.docType !== expectedDocType) 
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: messages.docType.mismatch(expectedDocType, data.country),
          path: ['docType'],
        })
      
    })
}

export function createLoginSchema(messages: Pick<ValidationMessages, 'email' | 'password'>) {
  return z.object({
    email: createEmailSchema(messages.email),
    password: z.string().min(1, messages.password.required),
  })
}
