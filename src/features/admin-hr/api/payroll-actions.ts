'use server'

import { z } from 'zod'

import { requireAdminHRWithOrg } from '@/src/shared/lib/auth'
import { prisma } from '@/src/shared/lib/db'
import { calculatePayrollForUser } from '@/src/shared/lib/payment/calculate-payroll'
import { generatePayrollForOrganization } from '@/src/shared/lib/payment/generate-payroll-core'
import {
  deletePayrollDocument as deletePayrollDocumentFromStorage,
  uploadPayrollDocument,
} from '@/src/shared/lib/storage/supabase-storage'
import type { ActionResult } from '@/src/shared/lib/types'
import { handleActionError } from '@/src/shared/lib/utils'
import { revalidatePaths } from '@/src/shared/lib/utils/revalidate-paths'
import {
  createPayrollDocument,
  deletePayrollDocument as deletePayrollDocumentRecord,
  updatePayrollPeriod,
} from '@/src/entities/payroll/lib/payroll-repository'
import { createNotification } from '@/src/features/notifications/lib/notification-service'

async function loadPdfModules() {
  const [{ renderToBuffer }, { PayrollDocumentPdf }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('@/src/features/payroll/ui/payroll-document-pdf'),
  ])
  return { renderToBuffer, PayrollDocumentPdf }
}

const PAYROLL_PATHS = ['/dashboard/payroll', '/dashboard/rates'] as const



export async function getBillingConfigAction(): Promise<
  ActionResult<{ billingDay: number | null; currency: string }>
> {
  try {
    const session = await requireAdminHRWithOrg()
    const org = await prisma.organization.findUniqueOrThrow({
      where: { id: session.organizationId },
      select: { billingDay: true, currency: true },
    })

    return { success: true, data: { billingDay: org.billingDay, currency: org.currency } }
  } catch (error) {
    return handleActionError(error, 'getBillingConfigAction', 'Error al obtener configuración')
  }
}



const updateBillingDaySchema = z.object({
  billingDay: z.number().int().min(1).max(31),
})

export async function updateBillingDayAction(
  data: z.infer<typeof updateBillingDaySchema>
): Promise<ActionResult<{ billingDay: number }>> {
  try {
    const session = await requireAdminHRWithOrg()
    const validated = updateBillingDaySchema.parse(data)

    await prisma.organization.update({
      where: { id: session.organizationId },
      data: { billingDay: validated.billingDay },
    })

    revalidatePaths(...PAYROLL_PATHS)
    return {
      success: true,
      data: { billingDay: validated.billingDay },
      message: 'Fecha de facturación actualizada',
    }
  } catch (error) {
    return handleActionError(
      error,
      'updateBillingDayAction',
      'Error al actualizar fecha de facturación'
    )
  }
}



const generatePayrollSchema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(new Date().getFullYear() + 1),
  force: z.boolean().optional().default(false),
})

export async function generatePayrollAction(
  data: z.infer<typeof generatePayrollSchema>
): Promise<
  ActionResult<{
    periodId: string
    documentsGenerated: number
    totalAmount: number
    errors: string[]
  }>
> {
  try {
    const session = await requireAdminHRWithOrg()
    const validated = generatePayrollSchema.parse(data)

    
    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()
    if (
      validated.year > currentYear ||
      (validated.year === currentYear && validated.month >= currentMonth)
    ) 
      return { success: false, error: 'No se puede generar nómina para un mes futuro' }
    

    const result = await generatePayrollForOrganization({
      organizationId: session.organizationId,
      month: validated.month,
      year: validated.year,
      force: validated.force,
      actorId: session.id,
    })

    if (!result.success) 
      return { success: false, error: result.error }
    

    revalidatePaths(...PAYROLL_PATHS)

    return {
      success: true,
      data: result.data,
      message:
        result.data.errors.length > 0
          ? `Nómina generada con ${result.data.errors.length} errores`
          : `Nómina generada: ${result.data.documentsGenerated} documentos`,
    }
  } catch (error) {
    return handleActionError(error, 'generatePayrollAction', 'Error al generar nómina')
  }
}



const regenerateDocumentSchema = z.object({
  periodId: z.string().min(1),
  userId: z.string().min(1),
})

export async function regeneratePayrollDocumentAction(
  data: z.infer<typeof regenerateDocumentSchema>
): Promise<ActionResult<{ documentId: string; totalAmount: number }>> {
  try {
    const session = await requireAdminHRWithOrg()
    const validated = regenerateDocumentSchema.parse(data)
    const organizationId = session.organizationId

    
    const period = await prisma.payrollPeriod.findFirst({
      where: { id: validated.periodId, organizationId },
    })
    if (!period) 
      return { success: false, error: 'Período de nómina no encontrado' }
    

    
    const existingDoc = await prisma.payrollDocument.findUnique({
      where: {
        payrollPeriodId_userId: {
          payrollPeriodId: validated.periodId,
          userId: validated.userId,
        },
      },
    })

    if (existingDoc) {
      await deletePayrollDocumentFromStorage(existingDoc.storagePath)
      await deletePayrollDocumentRecord(existingDoc.id, organizationId)
    }

    
    const result = await calculatePayrollForUser(
      validated.userId,
      organizationId,
      period.month,
      period.year
    )

    if (!result || result.totalAmount <= 0) {
      
      if (existingDoc) 
        await updatePayrollPeriod(period.id, {
          totalDocuments: Math.max(0, period.totalDocuments - 1),
          totalAmount: Math.max(0, period.totalAmount - existingDoc.totalAmount),
        })
      
      return { success: false, error: 'El empleado no tiene montos por pagar en este período' }
    }

    const org = await prisma.organization.findUniqueOrThrow({
      where: { id: organizationId },
      select: { currency: true, name: true, taxId: true, address: true },
    })

    const monthStr = String(period.month).padStart(2, '0')
    const { renderToBuffer, PayrollDocumentPdf } = await loadPdfModules()
    const pdfElement = PayrollDocumentPdf({
      data: result,
      orgName: org.name,
      orgTaxId: org.taxId,
      orgAddress: org.address,
    })
    const pdfBuffer = await renderToBuffer(pdfElement)

    const uploadResult = await uploadPayrollDocument(
      organizationId,
      period.year,
      monthStr,
      validated.userId,
      period.id,
      Buffer.from(pdfBuffer)
    )

    if (!uploadResult.success || !uploadResult.storagePath) 
      return { success: false, error: uploadResult.error ?? 'Error al subir documento' }
    

    const user = await prisma.user.findUniqueOrThrow({
      where: { id: validated.userId },
      select: { name: true },
    })
    const sanitizedName = user.name.toLowerCase().replace(/\s+/g, '-')
    const fileName = `nomina-${period.year}-${monthStr}-${sanitizedName}.pdf`

    const newDoc = await createPayrollDocument({
      payrollPeriodId: period.id,
      userId: validated.userId,
      organizationId,
      totalAmount: result.totalAmount,
      baseSalaryAmount: result.baseSalaryAmount,
      shiftsAmount: result.shiftsAmount,
      monthlyComponentsAmount: result.monthlyComponentsAmount,
      currency: org.currency,
      shiftsCount: result.shiftsCount,
      contractDaysInPeriod: result.contractDaysInPeriod,
      totalDaysInPeriod: result.totalDaysInPeriod,
      storagePath: uploadResult.storagePath,
      fileName,
    })

    
    const amountDiff = result.totalAmount - (existingDoc?.totalAmount ?? 0)
    const countDiff = existingDoc ? 0 : 1
    await updatePayrollPeriod(period.id, {
      totalDocuments: period.totalDocuments + countDiff,
      totalAmount: Math.round((period.totalAmount + amountDiff) * 100) / 100,
    })

    
    try {
      await createNotification({
        userId: validated.userId,
        actorId: session.id,
        organizationId,
        type: 'PAYROLL_DOCUMENT_AVAILABLE',
        title: `Tu documento de nómina de ${monthStr}/${period.year} ha sido actualizado`,
        actionUrl: '/dashboard/payroll',
      })
    } catch {
      
    }

    revalidatePaths(...PAYROLL_PATHS)

    return {
      success: true,
      data: { documentId: newDoc.id, totalAmount: result.totalAmount },
      message: 'Documento regenerado correctamente',
    }
  } catch (error) {
    return handleActionError(
      error,
      'regeneratePayrollDocumentAction',
      'Error al regenerar documento'
    )
  }
}



const deleteDocumentSchema = z.object({
  documentId: z.string().min(1),
})

export async function deletePayrollDocumentAction(
  data: z.infer<typeof deleteDocumentSchema>
): Promise<ActionResult<null>> {
  try {
    const session = await requireAdminHRWithOrg()
    const validated = deleteDocumentSchema.parse(data)
    const organizationId = session.organizationId

    
    const doc = await prisma.payrollDocument.findFirst({
      where: { id: validated.documentId, organizationId },
      include: { payrollPeriod: true },
    })

    if (!doc) 
      return { success: false, error: 'Documento no encontrado' }
    

    
    await deletePayrollDocumentFromStorage(doc.storagePath)

    
    await deletePayrollDocumentRecord(doc.id, organizationId)

    
    await updatePayrollPeriod(doc.payrollPeriodId, {
      totalDocuments: Math.max(0, doc.payrollPeriod.totalDocuments - 1),
      totalAmount: Math.max(0, Math.round((doc.payrollPeriod.totalAmount - doc.totalAmount) * 100) / 100),
    })

    revalidatePaths(...PAYROLL_PATHS)

    return { success: true, data: null, message: 'Documento eliminado' }
  } catch (error) {
    return handleActionError(
      error,
      'deletePayrollDocumentAction',
      'Error al eliminar documento'
    )
  }
}
