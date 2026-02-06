'use server'

import { revalidatePath } from 'next/cache'

import { requireAuth } from '@/src/shared/lib/auth/session'
import type { ActionResult } from '@/src/shared/lib/types'
import { uploadUserAvatar, deleteUserAvatar } from '@/src/shared/lib/storage'
import { prisma } from '@/src/shared/lib/db'
import { handleActionError } from '@/src/shared/lib/utils'

const MAX_FILE_SIZE = 5 * 1024 * 1024

export async function uploadAvatarAction(formData: FormData): Promise<ActionResult<{ url: string }>> {
  try {
    const user = await requireAuth()
    const file = formData.get('avatar') as File

    if (!file) 
      return {
        success: false,
        error: 'No se proporcionó ningún archivo',
      }
    

    if (file.size > MAX_FILE_SIZE) 
      return {
        success: false,
        error: 'El archivo no debe superar 5MB',
      }
    

    if (!file.type.startsWith('image/')) 
      return {
        success: false,
        error: 'El archivo debe ser una imagen',
      }
    

    const uploadResult = await uploadUserAvatar({
      userId: user.id,
      file,
      contentType: file.type,
    })

    if (!uploadResult.success) 
      return {
        success: false,
        error: uploadResult.error || 'Error al subir la imagen',
      }
    

    await prisma.user.update({
      where: { id: user.id },
      data: {
        customImage: uploadResult.publicUrl,
        imageProvider: 'UPLOAD',
      },
    })

    revalidatePath('/dashboard/profile')
    revalidatePath('/dashboard')

    return {
      success: true,
      data: { url: uploadResult.publicUrl! },
      message: 'Avatar actualizado exitosamente',
    }
  } catch (error) {
    return handleActionError(error, 'uploadAvatarAction', 'Error al subir el avatar')
  }
}

export async function deleteAvatarAction(): Promise<ActionResult<null>> {
  try {
    const user = await requireAuth()

    if (!user.customImage) 
      return {
        success: false,
        error: 'No hay imagen personalizada para eliminar',
      }
    

    const deleteResult = await deleteUserAvatar(user.id)

    if (!deleteResult.success) 
      return {
        success: false,
        error: deleteResult.error || 'Error al eliminar la imagen',
      }
    

    await prisma.user.update({
      where: { id: user.id },
      data: {
        customImage: null,
        imageProvider: user.image ? 'OAUTH' : null,
      },
    })

    revalidatePath('/dashboard/profile')
    revalidatePath('/dashboard')

    return {
      success: true,
      data: null,
      message: 'Avatar eliminado exitosamente',
    }
  } catch (error) {
    return handleActionError(error, 'deleteAvatarAction', 'Error al eliminar el avatar')
  }
}
