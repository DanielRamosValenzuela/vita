'use server'

import { z } from 'zod'

import { requireAdminHROrChief } from '@/src/shared/lib/auth/session'
import { prisma } from '@/src/shared/lib/db'
import { calculateShiftPayment } from '@/src/shared/lib/payment/calculate-shift-payment'
import type { ActionResult } from '@/src/shared/lib/types'
import { handleActionError } from '@/src/shared/lib/utils/action-error-handler'

const calculateShiftPaymentSchema = z.object({
  shiftId: z.string().min(1),
})

export async function calculateShiftPaymentAction(
  data: z.infer<typeof calculateShiftPaymentSchema>
): Promise<ActionResult<{ paymentId: string; finalAmount: number }>> {
  try {
    const session = await requireAdminHROrChief()
    const validatedData = calculateShiftPaymentSchema.parse(data)

    const organizationId = session.organizationId
    if (!organizationId) 
      return { success: false, error: 'No tienes una organización asignada' }
    

    
    const shift = await prisma.shift.findFirst({
      where: { id: validatedData.shiftId, organizationId },
      include: { payment: true },
    })

    if (!shift) 
      return { success: false, error: 'Turno no encontrado' }
    

    
    if (shift.payment) 
      return {
        success: true,
        data: {
          paymentId: shift.payment.id,
          finalAmount: shift.payment.finalAmount,
        },
        message: 'El pago ya fue calculado previamente',
      }
    

    if (!shift.contractId) 
      return { success: false, error: 'El turno no tiene un contrato asignado' }
    

    const result = await calculateShiftPayment(validatedData.shiftId)

    return {
      success: true,
      data: {
        paymentId: result.paymentId,
        finalAmount: result.finalAmount,
      },
    }
  } catch (error) {
    return handleActionError(error, 'calculateShiftPaymentAction', 'Error al calcular el pago del turno')
  }
}
