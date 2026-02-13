'use server'

import { revalidatePath } from 'next/cache'

import { requireSuperAdmin } from '@/src/shared/lib/auth/session'
import { handleActionError } from '@/src/shared/lib/utils'
import { getLocaleFromHeaders } from '@/src/shared/lib/utils/get-locale'

import {
  changeOrganizationStatus,
  checkTaxIdExists,
  createOrganization,
  deleteOrganization,
  updateOrganization,
} from '../data/organization-repository'
import {
  getChangeOrganizationStatusSchema,
  getCreateOrganizationSchema,
  getDeleteOrganizationSchema,
  getUpdateOrganizationSchema,
  type ChangeOrganizationStatusInput,
  type CreateOrganizationInput,
  type DeleteOrganizationInput,
  type UpdateOrganizationInput,
} from '../lib'

export const createOrganizationAction = async (data: CreateOrganizationInput) => {
  try {
    await requireSuperAdmin()

    const locale = await getLocaleFromHeaders()
    const createOrganizationSchema = await getCreateOrganizationSchema(locale)
    const validatedData = createOrganizationSchema.parse(data)

    const taxIdExists = await checkTaxIdExists(validatedData.taxId)
    if (taxIdExists)
      return {
        success: false,
        error: 'Ya existe una organización con este RUT/ID fiscal',
      }

    const organization = await createOrganization(validatedData)

    revalidatePath('/dashboard/organizations')
    revalidatePath('/dashboard')

    return {
      success: true,
      data: organization,
      message: 'Organización creada exitosamente',
    }
  } catch (error) {
    return handleActionError(error, 'createOrganizationAction', 'Error al crear la organización')
  }
}

export const updateOrganizationAction = async (data: UpdateOrganizationInput) => {
  try {
    await requireSuperAdmin()

    const locale = await getLocaleFromHeaders()
    const updateOrganizationSchema = await getUpdateOrganizationSchema(locale)
    const validatedData = updateOrganizationSchema.parse(data)
    const { id, ...updateData } = validatedData

    const organization = await updateOrganization(id, updateData)

    revalidatePath('/dashboard/organizations')
    revalidatePath(`/dashboard/organizations/${id}`)
    revalidatePath('/dashboard')

    return {
      success: true,
      data: organization,
      message: 'Organización actualizada exitosamente',
    }
  } catch (error) {
    return handleActionError(
      error,
      'updateOrganizationAction',
      'Error al actualizar la organización'
    )
  }
}

export const changeOrganizationStatusAction = async (data: ChangeOrganizationStatusInput) => {
  try {
    await requireSuperAdmin()

    const locale = await getLocaleFromHeaders()
    const changeOrganizationStatusSchema = await getChangeOrganizationStatusSchema(locale)
    const validatedData = changeOrganizationStatusSchema.parse(data)
    const { id, status } = validatedData

    const organization = await changeOrganizationStatus(id, status)

    revalidatePath('/dashboard/organizations')
    revalidatePath(`/dashboard/organizations/${id}`)
    revalidatePath('/dashboard')

    return {
      success: true,
      data: organization,
      message: `Estado cambiado a ${status} exitosamente`,
    }
  } catch (error) {
    return handleActionError(error, 'changeOrganizationStatusAction', 'Error al cambiar el estado')
  }
}

export const deleteOrganizationAction = async (data: DeleteOrganizationInput) => {
  try {
    await requireSuperAdmin()

    const locale = await getLocaleFromHeaders()
    const deleteOrganizationSchema = await getDeleteOrganizationSchema(locale)
    const validatedData = deleteOrganizationSchema.parse(data)
    const { id } = validatedData

    const organization = await deleteOrganization(id)

    revalidatePath('/dashboard/organizations')
    revalidatePath('/dashboard')

    return {
      success: true,
      data: organization,
      message: 'Organización eliminada exitosamente',
    }
  } catch (error) {
    return handleActionError(error, 'deleteOrganizationAction', 'Error al eliminar la organización')
  }
}
