'use server'

import { revalidatePath } from 'next/cache'

export async function getAreasAction() {
  return {
    success: true,
    data: [],
  }
}

export async function createAreaAction() {
  revalidatePath('/dashboard/areas')
  return {
    success: true,
  }
}

export async function updateAreaAction() {
  revalidatePath('/dashboard/areas')
  return {
    success: true,
  }
}

export async function deleteAreaAction() {
  revalidatePath('/dashboard/areas')
  return {
    success: true,
  }
}
