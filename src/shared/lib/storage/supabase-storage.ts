import { createClient } from '@supabase/supabase-js'

import { env } from '@/src/shared/config/env.server'

const supabaseUrl = env.SUPABASE_URL
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey)
  throw new Error('Missing Supabase credentials in environment variables')

const supabaseStorage = createClient(supabaseUrl, supabaseKey)

const AVATARS_BUCKET = 'avatars'

interface UploadAvatarOptions {
  userId: string
  file: File | Blob
  contentType?: string
}

interface UploadAvatarResult {
  success: boolean
  publicUrl?: string
  error?: string
}

export async function uploadUserAvatar({
  userId,
  file,
  contentType,
}: UploadAvatarOptions): Promise<UploadAvatarResult> {
  try {
    if (file.size > 5 * 1024 * 1024)
      return {
        success: false,
        error: 'La imagen no debe superar 5MB',
      }

    const ext = contentType?.split('/')[1] || 'jpg'
    const filePath = `${userId}/avatar.${ext}`

    const { error: uploadError } = await supabaseStorage.storage
      .from(AVATARS_BUCKET)
      .upload(filePath, file, {
        upsert: true,
        contentType: contentType || 'image/jpeg',
      })

    if (uploadError) {
      console.error('Error uploading avatar:', uploadError)
      return {
        success: false,
        error: 'Error al subir la imagen',
      }
    }

    const {
      data: { publicUrl },
    } = supabaseStorage.storage.from(AVATARS_BUCKET).getPublicUrl(filePath)

    return {
      success: true,
      publicUrl,
    }
  } catch (error) {
    console.error('Unexpected error uploading avatar:', error)
    return {
      success: false,
      error: 'Error inesperado al subir la imagen',
    }
  }
}

export async function deleteUserAvatar(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: files } = await supabaseStorage.storage.from(AVATARS_BUCKET).list(userId)

    if (!files || files.length === 0) return { success: true }

    const filePaths = files.map((file) => `${userId}/${file.name}`)

    const { error } = await supabaseStorage.storage.from(AVATARS_BUCKET).remove(filePaths)

    if (error) {
      console.error('Error deleting avatar:', error)
      return {
        success: false,
        error: 'Error al eliminar la imagen',
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Unexpected error deleting avatar:', error)
    return {
      success: false,
      error: 'Error inesperado al eliminar la imagen',
    }
  }
}
