'use server'

import { revalidatePath } from 'next/cache'

import { requireAdminHR } from '@/src/shared/lib/auth'
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

export async function createAreaAction(data: CreateAreaInput) {
  try {
    const user = await requireAdminHR()

    if (!user.organizationId)
      return {
        success: false,
        error: 'No estás vinculado a una organización',
      }

    const locale = await getLocaleFromHeaders()
    const createAreaSchema = await getCreateAreaSchema(locale)
    const validatedData = createAreaSchema.parse(data)
    const area = await createArea(validatedData, user.organizationId)

    revalidatePath('/dashboard/areas')
    revalidatePath('/dashboard/admin-hr')

    return {
      success: true,
      data: area,
      message: 'Área creada exitosamente',
    }
  } catch (error) {
    console.error('[createAreaAction] Error:', error)

    if (error instanceof Error && 'name' in error && error.name === 'ZodError')
      return {
        success: false,
        error: 'Datos inválidos',
      }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al crear el área',
    }
  }
}

export async function updateAreaAction(id: string, data: UpdateAreaInput) {
  try {
    const user = await requireAdminHR()

    if (!user.organizationId)
      return {
        success: false,
        error: 'No estás vinculado a una organización',
      }

    const locale = await getLocaleFromHeaders()
    const updateAreaSchema = await getUpdateAreaSchema(locale)
    const validatedData = updateAreaSchema.parse(data)
    const area = await updateArea(id, validatedData, user.organizationId)

    revalidatePath('/dashboard/areas')
    revalidatePath('/dashboard/admin-hr')

    return {
      success: true,
      data: area,
      message: 'Área actualizada exitosamente',
    }
  } catch (error) {
    console.error('[updateAreaAction] Error:', error)

    if (error instanceof Error && 'name' in error && error.name === 'ZodError')
      return {
        success: false,
        error: 'Datos inválidos',
      }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al actualizar el área',
    }
  }
}

export async function deleteAreaAction(id: string) {
  try {
    const user = await requireAdminHR()

    if (!user.organizationId)
      return {
        success: false,
        error: 'No estás vinculado a una organización',
      }

    await deleteArea(id, user.organizationId)

    revalidatePath('/dashboard/areas')
    revalidatePath('/dashboard/admin-hr')

    return {
      success: true,
      message: 'Área eliminada exitosamente',
    }
  } catch (error) {
    console.error('[deleteAreaAction] Error:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al eliminar el área',
    }
  }
}

export async function getAreasAction() {
  try {
    const user = await requireAdminHR()

    if (!user.organizationId)
      return {
        success: false,
        error: 'No estás vinculado a una organización',
      }

    const areas = await getAreas(user.organizationId)

    return {
      success: true,
      data: areas,
    }
  } catch (error) {
    console.error('[getAreasAction] Error:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener las áreas',
    }
  }
}
