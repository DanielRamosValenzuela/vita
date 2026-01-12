'use server'

import { revalidatePath } from 'next/cache'

export async function getShiftTypesAction() {
  return {
    success: true,
    data: [],
  }
}

export async function createShiftTypeAction() {
  revalidatePath('/dashboard/shift-types')
  return {
    success: true,
  }
}

export async function updateShiftTypeAction() {
  revalidatePath('/dashboard/shift-types')
  return {
    success: true,
  }
}

export async function deleteShiftTypeAction() {
  revalidatePath('/dashboard/shift-types')
  return {
    success: true,
  }
}
