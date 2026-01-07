'use server'

import { revalidatePath } from 'next/cache'
import {
  createOrganizationSchema,
  updateOrganizationSchema,
  changeOrganizationStatusSchema,
  deleteOrganizationSchema,
  type CreateOrganizationInput,
  type UpdateOrganizationInput,
  type ChangeOrganizationStatusInput,
  type DeleteOrganizationInput,
} from '../lib/schemas'
import {
  createOrganization,
  updateOrganization,
  changeOrganizationStatus,
  deleteOrganization,
  checkTaxIdExists,
} from '../lib/organization-helpers'
import { requireSuperAdmin } from '@/src/shared/lib/auth/session'

export const createOrganizationAction = async (data: CreateOrganizationInput) => {
  try {
    await requireSuperAdmin()

    const validatedData = createOrganizationSchema.parse(data)

    const taxIdExists = await checkTaxIdExists(validatedData.taxId)
    if (taxIdExists) {
      return {
        success: false,
        error: 'Ya existe una organización con este RUT/ID fiscal',
      }
    }

    const organization = await createOrganization(validatedData)

    revalidatePath('/super-admin/organizations')
    revalidatePath('/super-admin')

    return {
      success: true,
      data: organization,
      message: 'Organización creada exitosamente',
    }
  } catch (error) {
    console.error('[createOrganizationAction] Error:', error)

    if (error instanceof Error && 'name' in error && error.name === 'ZodError') {
      return {
        success: false,
        error: 'Datos inválidos',
        errors: 'errors' in error ? error.errors : [],
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al crear la organización',
    }
  }
}

export const updateOrganizationAction = async (data: UpdateOrganizationInput) => {
  try {
    await requireSuperAdmin()

    const validatedData = updateOrganizationSchema.parse(data)
    const { id, ...updateData } = validatedData

    const organization = await updateOrganization(id, updateData)

    revalidatePath('/super-admin/organizations')
    revalidatePath(`/super-admin/organizations/${id}`)
    revalidatePath('/super-admin')

    return {
      success: true,
      data: organization,
      message: 'Organización actualizada exitosamente',
    }
  } catch (error) {
    console.error('[updateOrganizationAction] Error:', error)

    if (error instanceof Error && 'name' in error && error.name === 'ZodError') {
      return {
        success: false,
        error: 'Datos inválidos',
        errors: 'errors' in error ? error.errors : [],
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al actualizar la organización',
    }
  }
}

export const changeOrganizationStatusAction = async (data: ChangeOrganizationStatusInput) => {
  try {
    await requireSuperAdmin()

    const validatedData = changeOrganizationStatusSchema.parse(data)
    const { id, status } = validatedData

    const organization = await changeOrganizationStatus(id, status)

    revalidatePath('/super-admin/organizations')
    revalidatePath(`/super-admin/organizations/${id}`)
    revalidatePath('/super-admin')

    return {
      success: true,
      data: organization,
      message: `Estado cambiado a ${status} exitosamente`,
    }
  } catch (error) {
    console.error('[changeOrganizationStatusAction] Error:', error)

    if (error instanceof Error && 'name' in error && error.name === 'ZodError') {
      return {
        success: false,
        error: 'Datos inválidos',
        errors: 'errors' in error ? error.errors : [],
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al cambiar el estado',
    }
  }
}

export const deleteOrganizationAction = async (data: DeleteOrganizationInput) => {
  try {
    await requireSuperAdmin()

    const validatedData = deleteOrganizationSchema.parse(data)
    const { id } = validatedData

    const organization = await deleteOrganization(id)

    revalidatePath('/super-admin/organizations')
    revalidatePath('/super-admin')

    return {
      success: true,
      data: organization,
      message: 'Organización eliminada exitosamente',
    }
  } catch (error) {
    console.error('[deleteOrganizationAction] Error:', error)

    if (error instanceof Error && 'name' in error && error.name === 'ZodError') {
      return {
        success: false,
        error: 'Datos inválidos',
        errors: 'errors' in error ? error.errors : [],
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al eliminar la organización',
    }
  }
}
