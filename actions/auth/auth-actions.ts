'use server'

import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/auth/config'
import { registerSchema, loginSchema } from '@/lib/validations/auth'
import { Country, DocType } from '@prisma/client'

export interface ActionResult<T = unknown> {
  success: boolean
  data?: T
  error?: string
  fieldErrors?: Record<string, string[]>
}

export async function registerAction(
  formData: FormData
): Promise<ActionResult<{ email: string; name: string }>> {
  try {
    const rawData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      rut: formData.get('rut') as string,
      password: formData.get('password') as string,
      confirmPassword: formData.get('confirmPassword') as string,
      country: (formData.get('country') as Country) || Country.CL,
      docType: (formData.get('docType') as DocType) || DocType.RUT,
    }

    const validationResult = registerSchema.safeParse(rawData)

    if (!validationResult.success) {
      const fieldErrors: Record<string, string[]> = {}
      validationResult.error.issues.forEach((err: z.ZodIssue) => {
        const field = err.path[0] as string
        if (!fieldErrors[field]) {
          fieldErrors[field] = []
        }
        fieldErrors[field].push(err.message)
      })

      return {
        success: false,
        error: 'Error de validación',
        fieldErrors,
      }
    }

    const data = validationResult.data

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (existingUser) {
      return {
        success: false,
        error: 'Este email ya está registrado',
        fieldErrors: {
          email: ['Este email ya está registrado'],
        },
      }
    }

    const existingDoc = await prisma.user.findFirst({
      where: {
        country: data.country,
        docType: data.docType,
        docNumber: data.rut.replace(/[.-]/g, ''),
      },
    })

    if (existingDoc) {
      return {
        success: false,
        error: 'Este RUT ya está registrado',
        fieldErrors: {
          rut: ['Este RUT ya está registrado'],
        },
      }
    }

    const hashedPassword = await bcrypt.hash(data.password, 12)

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        country: data.country,
        docType: data.docType,
        docNumber: data.rut.replace(/[.-]/g, ''),
        role: 'STAFF_HEALTH',
      },
    })

    await prisma.account.create({
      data: {
        userId: user.id,
        type: 'credentials',
        provider: 'credentials',
        providerAccountId: user.id,
        access_token: hashedPassword,
      },
    })

    return {
      success: true,
      data: {
        email: user.email,
        name: user.name,
      },
    }
  } catch (error) {
    console.error('Error en registerAction:', error)
    return {
      success: false,
      error: 'Error al registrar usuario. Por favor, intenta nuevamente.',
    }
  }
}

export async function loginAction(formData: FormData): Promise<ActionResult> {
  try {
    const rawData = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    }

    const validationResult = loginSchema.safeParse(rawData)

    if (!validationResult.success) {
      const fieldErrors: Record<string, string[]> = {}
      validationResult.error.issues.forEach((err: z.ZodIssue) => {
        const field = err.path[0] as string
        if (!fieldErrors[field]) {
          fieldErrors[field] = []
        }
        fieldErrors[field].push(err.message)
      })

      return {
        success: false,
        error: 'Error de validación',
        fieldErrors,
      }
    }

    const data = validationResult.data

    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: {
        accounts: {
          where: {
            provider: 'credentials',
          },
        },
      },
    })

    if (!user) {
      return {
        success: false,
        error: 'Credenciales inválidas',
        fieldErrors: {
          email: ['Email o contraseña incorrectos'],
        },
      }
    }

    const credentialsAccount = user.accounts.find(
      (acc) => acc.provider === 'credentials'
    )

    if (!credentialsAccount) {
      return {
        success: false,
        error: 'Este usuario no tiene credenciales configuradas. Usa Google OAuth para iniciar sesión.',
        fieldErrors: {
          email: ['Usa Google OAuth para iniciar sesión'],
        },
      }
    }

    const isValidPassword = await bcrypt.compare(
      data.password,
      credentialsAccount.access_token || ''
    )

    if (!isValidPassword) {
      return {
        success: false,
        error: 'Credenciales inválidas',
        fieldErrors: {
          email: ['Email o contraseña incorrectos'],
        },
      }
    }

    return {
      success: true,
      data: {
        email: user.email,
        name: user.name,
      },
    }
  } catch (error) {
    console.error('Error en loginAction:', error)
    return {
      success: false,
      error: 'Error al iniciar sesión. Por favor, intenta nuevamente.',
    }
  }
}

export async function logoutAction(): Promise<ActionResult> {
  try {
    return {
      success: true,
    }
  } catch (error) {
    console.error('Error en logoutAction:', error)
    return {
      success: false,
      error: 'Error al cerrar sesión',
    }
  }
}

