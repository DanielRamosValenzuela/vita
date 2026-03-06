'use server'

import { z } from 'zod'

import { getChiefAccessibleAreaIds } from '@/src/shared/lib/auth/chief-access'
import { isChiefArea, isStaff } from '@/src/shared/lib/auth/rbac'
import { requireDashboardUser } from '@/src/shared/lib/auth/session'
import { getPayrollDocumentSignedUrl } from '@/src/shared/lib/storage/supabase-storage'
import type { ActionResult } from '@/src/shared/lib/types'
import { handleActionError } from '@/src/shared/lib/utils'

import {
  getPayrollDocumentById,
  getPayrollDocuments,
  getPayrollPeriods,
} from '@/src/entities/payroll/lib/payroll-repository'
import type { PayrollDocumentSummary, PayrollPeriodSummary } from '@/src/entities/payroll/lib/types'

const getPeriodsSchema = z.object({
  year: z.number().int().optional(),
})

export async function getPayrollPeriodsAction(
  data?: z.infer<typeof getPeriodsSchema>
): Promise<ActionResult<PayrollPeriodSummary[]>> {
  try {
    const session = await requireDashboardUser()
    const organizationId = session.organizationId
    if (!organizationId) return { success: false, error: 'No tienes una organización asignada' }

    const validated = data ? getPeriodsSchema.parse(data) : {}
    const periods = await getPayrollPeriods(organizationId, validated.year)

    return { success: true, data: periods }
  } catch (error) {
    return handleActionError(error, 'getPayrollPeriodsAction', 'Error al obtener períodos')
  }
}

const getDocumentsSchema = z.object({
  periodId: z.string().min(1),
})

export async function getPayrollDocumentsAction(
  data: z.infer<typeof getDocumentsSchema>
): Promise<ActionResult<PayrollDocumentSummary[]>> {
  try {
    const session = await requireDashboardUser()
    const organizationId = session.organizationId
    if (!organizationId) return { success: false, error: 'No tienes una organización asignada' }

    const validated = getDocumentsSchema.parse(data)

    let options: { userId?: string; areaIds?: string[] } | undefined

    if (isStaff(session)) options = { userId: session.id }
    else if (isChiefArea(session)) {
      const areaIds = await getChiefAccessibleAreaIds(session.id)
      options = { areaIds }
    }

    const documents = await getPayrollDocuments(validated.periodId, organizationId, options)

    return { success: true, data: documents }
  } catch (error) {
    return handleActionError(error, 'getPayrollDocumentsAction', 'Error al obtener documentos')
  }
}

const downloadSchema = z.object({
  documentId: z.string().min(1),
})

export async function downloadPayrollDocumentAction(
  data: z.infer<typeof downloadSchema>
): Promise<ActionResult<{ signedUrl: string; fileName: string }>> {
  try {
    const session = await requireDashboardUser()
    const organizationId = session.organizationId
    if (!organizationId) return { success: false, error: 'No tienes una organización asignada' }

    const validated = downloadSchema.parse(data)

    const doc = await getPayrollDocumentById(validated.documentId, organizationId)
    if (!doc) return { success: false, error: 'Documento no encontrado' }

    if (isStaff(session) && doc.userId !== session.id)
      return { success: false, error: 'No tienes permiso para descargar este documento' }

    if (isChiefArea(session)) {
      const areaIds = await getChiefAccessibleAreaIds(session.id)

      const userAreas = await import('@/src/shared/lib/db').then(({ prisma }) =>
        prisma.userArea.findMany({
          where: { userId: doc.userId },
          select: { areaId: true },
        })
      )
      const hasAccess = userAreas.some((ua: { areaId: string }) => areaIds.includes(ua.areaId))
      if (!hasAccess)
        return { success: false, error: 'No tienes permiso para descargar este documento' }
    }

    const result = await getPayrollDocumentSignedUrl(doc.storagePath, 3600)
    if (!result.success || !result.signedUrl)
      return { success: false, error: result.error ?? 'Error al generar enlace de descarga' }

    return {
      success: true,
      data: { signedUrl: result.signedUrl, fileName: doc.fileName },
    }
  } catch (error) {
    return handleActionError(error, 'downloadPayrollDocumentAction', 'Error al descargar documento')
  }
}
