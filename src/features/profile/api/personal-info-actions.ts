'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { getCurrentUser } from '@/src/shared/lib/auth/session'
import { handleActionError } from '@/src/shared/lib/utils/action-error-handler'

import { updatePersonalInfo } from '../data/profile-repository'

const updatePersonalInfoSchema = z.object({
  name: z.string().min(2),
  phone: z.string().optional(),
  address: z.string().optional(),
  additionalInfo: z.string().optional(),
  birthDate: z.date().optional().nullable(),
})

export async function updatePersonalInfoAction(
  data: z.infer<typeof updatePersonalInfoSchema>
) {
  try {
    const user = await getCurrentUser()

    if (!user) 
      return {
        success: false,
        error: 'No autenticado',
      }
    

    const validation = updatePersonalInfoSchema.safeParse(data)

    if (!validation.success) 
      return {
        success: false,
        error: 'Datos inválidos',
      }
    

    await updatePersonalInfo(user.id, validation.data)

    revalidatePath('/dashboard/profile')

    return { success: true }
  } catch (error) {
    return handleActionError(error, 'updatePersonalInfo', 'Error al actualizar información personal')
  }
}
