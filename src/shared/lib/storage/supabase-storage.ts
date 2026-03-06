import { createClient } from '@supabase/supabase-js'

import { env } from '@/src/shared/config/env.server'

const supabaseUrl = env.SUPABASE_URL
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey)
  throw new Error('Missing Supabase credentials in environment variables')

const supabaseStorage = createClient(supabaseUrl, supabaseKey)

const AVATARS_BUCKET = 'avatars'
const PAYROLL_BUCKET = 'payroll-documents'

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

export async function uploadPayrollDocument(
  organizationId: string,
  year: number,
  month: string,
  userId: string,
  periodId: string,
  buffer: Buffer | Uint8Array
): Promise<{ success: boolean; storagePath?: string; error?: string }> {
  try {
    const storagePath = `${organizationId}/${year}/${month}/${userId}-${periodId}.pdf`

    const { error: uploadError } = await supabaseStorage.storage
      .from(PAYROLL_BUCKET)
      .upload(storagePath, buffer, {
        upsert: true,
        contentType: 'application/pdf',
      })

    if (uploadError) {
      console.error('Error uploading payroll document:', uploadError)
      return { success: false, error: 'Error al subir el documento de nómina' }
    }

    return { success: true, storagePath }
  } catch (error) {
    console.error('Unexpected error uploading payroll document:', error)
    return { success: false, error: 'Error inesperado al subir el documento' }
  }
}

export async function deletePayrollDocument(
  storagePath: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseStorage.storage.from(PAYROLL_BUCKET).remove([storagePath])

    if (error) {
      console.error('Error deleting payroll document:', error)
      return { success: false, error: 'Error al eliminar el documento' }
    }

    return { success: true }
  } catch (error) {
    console.error('Unexpected error deleting payroll document:', error)
    return { success: false, error: 'Error inesperado al eliminar el documento' }
  }
}

export async function getPayrollDocumentSignedUrl(
  storagePath: string,
  expiresIn: number = 3600
): Promise<{ success: boolean; signedUrl?: string; error?: string }> {
  try {
    const { data, error } = await supabaseStorage.storage
      .from(PAYROLL_BUCKET)
      .createSignedUrl(storagePath, expiresIn)

    if (error || !data?.signedUrl) {
      console.error('Error generating signed URL:', error)
      return { success: false, error: 'Error al generar enlace de descarga' }
    }

    return { success: true, signedUrl: data.signedUrl }
  } catch (error) {
    console.error('Unexpected error generating signed URL:', error)
    return { success: false, error: 'Error inesperado al generar enlace' }
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
