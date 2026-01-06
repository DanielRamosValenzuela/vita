'use server'

import { registerSchema, loginSchema } from '../lib/schemas'
import { Country, DocType } from '@prisma/client'
import { formatZodErrors } from '../lib/validation-helpers'
import {
  checkEmailExists,
  checkDocExists,
  createUserWithAccount,
  findUserWithCredentials,
  verifyPassword,
} from '../lib/user-helpers'

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
      return {
        success: false,
        error: 'Error de validación',
        fieldErrors: formatZodErrors(validationResult.error),
      }
    }

    const data = validationResult.data

    if (await checkEmailExists(data.email)) {
      return {
        success: false,
        error: 'Este email ya está registrado',
        fieldErrors: {
          email: ['Este email ya está registrado'],
        },
      }
    }

    const cleanDocNumber = data.rut.replace(/[.-]/g, '')
    if (await checkDocExists(data.country, data.docType, cleanDocNumber)) {
      return {
        success: false,
        error: 'Este RUT ya está registrado',
        fieldErrors: {
          rut: ['Este RUT ya está registrado'],
        },
      }
    }

    const userData = await createUserWithAccount(data)

    return {
      success: true,
      data: userData,
    }
  } catch (error) {
    console.error('Error en registerAction:', error)
    return {
      success: false,
      error: 'Error al registrar usuario. Por favor, intenta nuevamente.',
    }
  }
}

export async function loginAction(
  formData: FormData
): Promise<ActionResult<{ email: string }>> {
  try {
    const rawData = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    }

    const validationResult = loginSchema.safeParse(rawData)

    if (!validationResult.success) {
      return {
        success: false,
        error: 'Error de validación',
        fieldErrors: formatZodErrors(validationResult.error),
      }
    }

    const data = validationResult.data
    const user = await findUserWithCredentials(data.email)

    if (!user || !user.accounts || user.accounts.length === 0) {
      return {
        success: false,
        error: 'Credenciales inválidas',
        fieldErrors: {
          email: ['Email o contraseña incorrectos'],
        },
      }
    }

    const hashedPassword = user.accounts[0].access_token
    if (!hashedPassword) {
      return {
        success: false,
        error: 'Credenciales inválidas',
        fieldErrors: {
          email: ['Email o contraseña incorrectos'],
        },
      }
    }

    const isValidPassword = await verifyPassword(data.password, hashedPassword)

    if (!isValidPassword) {
      return {
        success: false,
        error: 'Credenciales inválidas',
        fieldErrors: {
          password: ['Email o contraseña incorrectos'],
        },
      }
    }

    return {
      success: true,
      data: {
        email: user.email,
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
      error: 'Error al cerrar sesión. Por favor, intenta nuevamente.',
    }
  }
}

