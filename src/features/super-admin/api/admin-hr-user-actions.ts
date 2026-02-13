'use server'

import { revalidatePath } from 'next/cache'

import { requireSuperAdmin } from '@/src/shared/lib/auth/session'
import { getLocaleFromHeaders } from '@/src/shared/lib/utils/get-locale'

import {
  checkEmailExists,
  createAdminHRUser,
  deleteAdminHRUser,
  updateAdminHRUser,
} from '../data/admin-hr-user-repository'
import {
  getCreateAdminHRUserSchema,
  getUpdateAdminHRUserSchema,
  type CreateAdminHRUserInput,
  type UpdateAdminHRUserInput,
} from '../lib/schemas'

export async function createAdminHRUserAction(data: CreateAdminHRUserInput) {
  try {
    await requireSuperAdmin()

    const locale = await getLocaleFromHeaders()
    const createAdminHRUserSchema = await getCreateAdminHRUserSchema(locale)
    const validatedData = createAdminHRUserSchema.parse(data)

    const emailExists = await checkEmailExists(validatedData.email)
    if (emailExists)
      return {
        success: false,
        error: 'Ya existe un usuario con este email',
      }

    const user = await createAdminHRUser(validatedData)

    revalidatePath('/dashboard/admin-hr-users')
    revalidatePath('/dashboard')

    return {
      success: true,
      data: user,
      message: 'Usuario ADMIN_HR creado exitosamente',
    }
  } catch (error) {
    console.error('[createAdminHRUserAction] Error:', error)

    if (error instanceof Error && 'name' in error && error.name === 'ZodError')
      return {
        success: false,
        error: 'Datos inválidos',
      }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al crear el usuario ADMIN_HR',
    }
  }
}

export async function updateAdminHRUserAction(id: string, data: UpdateAdminHRUserInput) {
  try {
    await requireSuperAdmin()

    const locale = await getLocaleFromHeaders()
    const updateAdminHRUserSchema = await getUpdateAdminHRUserSchema(locale)
    const validatedData = updateAdminHRUserSchema.parse(data)

    if (validatedData.email) {
      const emailExists = await checkEmailExists(validatedData.email, id)
      if (emailExists)
        return {
          success: false,
          error: 'Ya existe un usuario con este email',
        }
    }

    const user = await updateAdminHRUser(id, validatedData)

    revalidatePath('/dashboard/admin-hr-users')
    revalidatePath('/dashboard')

    return {
      success: true,
      data: user,
      message: 'Usuario ADMIN_HR actualizado exitosamente',
    }
  } catch (error) {
    console.error('[updateAdminHRUserAction] Error:', error)

    if (error instanceof Error && 'name' in error && error.name === 'ZodError')
      return {
        success: false,
        error: 'Datos inválidos',
      }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al actualizar el usuario ADMIN_HR',
    }
  }
}

export async function deleteAdminHRUserAction(id: string) {
  try {
    await requireSuperAdmin()

    await deleteAdminHRUser(id)

    revalidatePath('/dashboard/admin-hr-users')
    revalidatePath('/dashboard')

    return {
      success: true,
      message: 'Usuario ADMIN_HR eliminado exitosamente',
    }
  } catch (error) {
    console.error('[deleteAdminHRUserAction] Error:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al eliminar el usuario ADMIN_HR',
    }
  }
}
