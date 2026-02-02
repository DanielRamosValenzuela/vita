'use server'

import { requireAdminHRWithOrg } from '@/src/shared/lib/auth'
import { handleActionError } from '@/src/shared/lib/utils'
import { revalidatePaths } from '@/src/shared/lib/utils/revalidate-paths'
import { getLocaleFromHeaders } from '@/src/shared/lib/utils/get-locale'

import {
  createArea,
  deleteArea,
  getAreas,
  updateArea,
} from '@/src/entities/area'
import {
  getCreateAreaSchema,
  getUpdateAreaSchema,
  type CreateAreaInput,
  type UpdateAreaInput,
} from '../lib/schemas'

const AREA_PATHS = ['/dashboard/areas', '/dashboard/admin-hr'] as const

export async function createAreaAction(data: CreateAreaInput) {
  try {
    const user = await requireAdminHRWithOrg()

    const locale = await getLocaleFromHeaders()
    const createAreaSchema = await getCreateAreaSchema(locale)
    const validatedData = createAreaSchema.parse(data)
    const area = await createArea(validatedData, user.organizationId)

    revalidatePaths(...AREA_PATHS)

    return {
      success: true,
      data: area,
      message: 'Área creada exitosamente',
    }
  } catch (error) {
    return handleActionError(error, 'createAreaAction', 'Error al crear el área')
  }
}

export async function updateAreaAction(id: string, data: UpdateAreaInput) {
  try {
    const user = await requireAdminHRWithOrg()

    const locale = await getLocaleFromHeaders()
    const updateAreaSchema = await getUpdateAreaSchema(locale)
    const validatedData = updateAreaSchema.parse(data)
    const area = await updateArea(id, validatedData, user.organizationId)

    revalidatePaths(...AREA_PATHS)

    return {
      success: true,
      data: area,
      message: 'Área actualizada exitosamente',
    }
  } catch (error) {
    return handleActionError(
      error,
      'updateAreaAction',
      'Error al actualizar el área'
    )
  }
}

export async function deleteAreaAction(id: string) {
  try {
    const user = await requireAdminHRWithOrg()

    await deleteArea(id, user.organizationId)

    revalidatePaths(...AREA_PATHS)

    return {
      success: true,
      message: 'Área eliminada exitosamente',
    }
  } catch (error) {
    return handleActionError(
      error,
      'deleteAreaAction',
      'Error al eliminar el área'
    )
  }
}

export async function getAreasAction() {
  try {
    const user = await requireAdminHRWithOrg()

    const areas = await getAreas(user.organizationId)

    return {
      success: true,
      data: areas,
    }
  } catch (error) {
    return handleActionError(
      error,
      'getAreasAction',
      'Error al obtener las áreas'
    )
  }
}
