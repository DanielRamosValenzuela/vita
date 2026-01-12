'use server'

import { revalidatePath } from 'next/cache'

export async function getRatesAction() {
  return {
    success: true,
    data: [],
  }
}

export async function createRateAction() {
  revalidatePath('/dashboard/rates')
  return {
    success: true,
  }
}

export async function updateRateAction() {
  revalidatePath('/dashboard/rates')
  return {
    success: true,
  }
}

export async function deleteRateAction() {
  revalidatePath('/dashboard/rates')
  return {
    success: true,
  }
}
