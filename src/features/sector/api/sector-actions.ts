'use server'

import { getTranslations } from 'next-intl/server'
import { Role } from '@prisma/client'

import {
  isAdminHR,
  isChiefArea,
  isStaff,
  requireAdminHRWithOrg,
  requireDashboardUser,
} from '@/src/shared/lib/auth'
import { prisma } from '@/src/shared/lib/db'
import { handleActionError } from '@/src/shared/lib/utils'
import { getLocaleFromHeaders } from '@/src/shared/lib/utils/get-locale'
import { revalidatePaths } from '@/src/shared/lib/utils/revalidate-paths'

import { createSector, deleteSector, getSectors, updateSector } from '@/src/entities/sector'

import { getCreateSectorSchema, getUpdateSectorSchema } from '../lib/helpers/server'
import type { CreateSectorInput, UpdateSectorInput } from '../lib/types'

const SECTOR_PATHS = ['/dashboard/sectors', '/dashboard/admin-hr'] as const

export async function createSectorAction(data: CreateSectorInput) {
  try {
    const user = await requireAdminHRWithOrg()
    const locale = await getLocaleFromHeaders()
    const t = await getTranslations({ locale, namespace: 'adminHR.sectors' })
    const createSchema = await getCreateSectorSchema(locale)
    const validatedData = createSchema.parse(data)

    const existing = await prisma.sector.findFirst({
      where: { organizationId: user.organizationId, name: validatedData.name },
    })
    if (existing) return { success: false as const, error: t('duplicateName') }

    const sector = await createSector(validatedData, user.organizationId)
    revalidatePaths(...SECTOR_PATHS)
    return { success: true as const, data: sector, message: t('createSuccess') }
  } catch (error) {
    return handleActionError(error, 'createSectorAction', 'Error al crear el sector')
  }
}

export async function updateSectorAction(id: string, data: UpdateSectorInput) {
  try {
    const user = await requireDashboardUser()
    const locale = await getLocaleFromHeaders()
    const t = await getTranslations({ locale, namespace: 'adminHR.sectors' })

    let orgId: string | null = user.organizationId ?? null

    if (isChiefArea(user)) {
      if (!orgId) orgId = await resolveOrgIdFromUserArea(user.id)
      if (!orgId) return { success: false as const, error: t('noOrganization') }

      const isSectorChief = await prisma.userSector.findUnique({
        where: { userId_sectorId: { userId: user.id, sectorId: id } },
      })
      if (!isSectorChief) return { success: false as const, error: t('noPermission') }
    } else if (isStaff(user)) return { success: false as const, error: t('noPermission') }
    else if (!isAdminHR(user)) return { success: false as const, error: t('noPermission') }
    else if (!orgId) throw new Error('No estás vinculado a una organización')

    const updateSchema = await getUpdateSectorSchema(locale)
    const validatedData = updateSchema.parse(data)

    if (validatedData.name) {
      const existing = await prisma.sector.findFirst({
        where: {
          organizationId: orgId!,
          name: validatedData.name,
          NOT: { id },
        },
      })
      if (existing) return { success: false as const, error: t('duplicateName') }
    }

    const sector = await updateSector(id, validatedData, orgId!)
    revalidatePaths(...SECTOR_PATHS)
    return { success: true as const, data: sector, message: t('editSuccess') }
  } catch (error) {
    return handleActionError(error, 'updateSectorAction', 'Error al actualizar el sector')
  }
}

export async function deleteSectorAction(id: string) {
  try {
    const user = await requireAdminHRWithOrg()
    const locale = await getLocaleFromHeaders()
    const t = await getTranslations({ locale, namespace: 'validation.common' })
    await deleteSector(id, user.organizationId)
    revalidatePaths(...SECTOR_PATHS)
    return { success: true as const, message: t('deleted') }
  } catch (error) {
    return handleActionError(error, 'deleteSectorAction', 'Error al eliminar el sector')
  }
}

async function resolveOrgIdFromUserArea(userId: string): Promise<string | null> {
  const firstArea = await prisma.userArea.findFirst({
    where: { userId },
    select: { area: { select: { organizationId: true } } },
  })
  return firstArea?.area?.organizationId ?? null
}

export async function getSectorsAction() {
  try {
    const user = await requireDashboardUser()
    let orgId: string | null = user.organizationId ?? null

    if ((isChiefArea(user) || isStaff(user)) && !orgId)
      orgId = await resolveOrgIdFromUserArea(user.id)

    if (!orgId) return { success: false as const, error: 'No tienes una organización asignada' }

    if (isChiefArea(user) || isStaff(user)) {
      const userAreas = await prisma.userArea.findMany({
        where: { userId: user.id },
        select: { areaId: true },
      })
      const areaIds = userAreas.map((ua) => ua.areaId)

      const userSectorIds = isChiefArea(user)
        ? (
            await prisma.userSector.findMany({
              where: { userId: user.id },
              select: { sectorId: true },
            })
          ).map((us) => us.sectorId)
        : []

      if (areaIds.length === 0 && userSectorIds.length === 0)
        return { success: true as const, data: [] }

      const sectors = await prisma.sector.findMany({
        where: {
          organizationId: orgId,
          OR: [
            ...(areaIds.length > 0 ? [{ sectorAreas: { some: { areaId: { in: areaIds } } } }] : []),
            ...(userSectorIds.length > 0 ? [{ id: { in: userSectorIds } }] : []),
          ],
        },
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { sectorAreas: true } },
          sectorAreas: {
            include: {
              area: {
                select: { id: true, name: true, icon: true, color: true },
              },
            },
          },
        },
      })
      return { success: true as const, data: sectors }
    }

    const sectors = await getSectors(orgId)
    return { success: true as const, data: sectors }
  } catch (error) {
    return handleActionError(error, 'getSectorsAction', 'Error al cargar los sectores')
  }
}

export async function assignAreasToSectorAction(sectorId: string, areaIds: string[]) {
  try {
    const user = await requireAdminHRWithOrg()

    const sector = await prisma.sector.findFirst({
      where: { id: sectorId, organizationId: user.organizationId },
    })
    if (!sector) return { success: false as const, error: 'Sector no encontrado' }

    const validAreas = await prisma.area.findMany({
      where: { id: { in: areaIds }, organizationId: user.organizationId },
      select: { id: true },
    })
    const validAreaIds = validAreas.map((a) => a.id)

    await prisma.$transaction([
      prisma.sectorArea.deleteMany({ where: { sectorId } }),
      ...(validAreaIds.length > 0
        ? [
            prisma.sectorArea.createMany({
              data: validAreaIds.map((areaId) => ({ sectorId, areaId })),
            }),
          ]
        : []),
    ])

    const sectorChiefs = await prisma.userSector.findMany({
      where: { sectorId },
      select: { userId: true },
    })

    if (sectorChiefs.length > 0 && validAreaIds.length > 0) {
      const upsertData = sectorChiefs.flatMap((chief) =>
        validAreaIds.map((areaId) => ({
          userId: chief.userId,
          areaId,
        }))
      )
      await prisma.userArea.createMany({
        data: upsertData,
        skipDuplicates: true,
      })
    }

    revalidatePaths(...SECTOR_PATHS)
    return { success: true as const }
  } catch (error) {
    return handleActionError(error, 'assignAreasToSectorAction', 'Error al asignar áreas')
  }
}

export interface ChiefSectorOption {
  id: string
  name: string
  email: string
  docNumber: string | null
}

export async function getChiefsForSectorAction(sectorId: string) {
  try {
    const user = await requireAdminHRWithOrg()

    const sector = await prisma.sector.findFirst({
      where: { id: sectorId, organizationId: user.organizationId },
      select: { id: true },
    })
    if (!sector) return { success: false as const, error: 'Sector no encontrado' }

    const chiefs = await prisma.user.findMany({
      where: {
        organizationId: user.organizationId,
        role: Role.CHIEF_AREA,
      },
      select: { id: true, name: true, email: true, docNumber: true },
      orderBy: { name: 'asc' },
    })

    const assignedChiefs = await prisma.userSector.findMany({
      where: { sectorId },
      select: { userId: true },
    })
    const assignedChiefIds = assignedChiefs.map((uc) => uc.userId)

    return {
      success: true as const,
      data: {
        chiefs: chiefs as ChiefSectorOption[],
        assignedChiefIds,
      },
    }
  } catch (error) {
    return handleActionError(error, 'getChiefsForSectorAction', 'Error al cargar jefes del sector')
  }
}

export async function assignChiefToSectorAction(sectorId: string, chiefUserIds: string[]) {
  try {
    const user = await requireAdminHRWithOrg()

    const sector = await prisma.sector.findFirst({
      where: { id: sectorId, organizationId: user.organizationId },
      include: { sectorAreas: { select: { areaId: true } } },
    })
    if (!sector) return { success: false as const, error: 'Sector no encontrado' }

    if (chiefUserIds.length > 0) {
      const validChiefs = await prisma.user.findMany({
        where: {
          id: { in: chiefUserIds },
          organizationId: user.organizationId,
          role: Role.CHIEF_AREA,
        },
        select: { id: true },
      })
      const validChiefIds = validChiefs.map((c) => c.id)

      if (validChiefIds.length !== chiefUserIds.length)
        return { success: false as const, error: 'Algunos usuarios no son CHIEF_AREA válidos' }
    }

    const sectorAreaIds = sector.sectorAreas.map((sa) => sa.areaId)

    await prisma.$transaction([
      prisma.userSector.deleteMany({ where: { sectorId } }),
      ...(chiefUserIds.length > 0
        ? [
            prisma.userSector.createMany({
              data: chiefUserIds.map((userId) => ({ userId, sectorId })),
            }),
          ]
        : []),
    ])

    if (chiefUserIds.length > 0 && sectorAreaIds.length > 0) {
      const upsertData = chiefUserIds.flatMap((userId) =>
        sectorAreaIds.map((areaId) => ({ userId, areaId }))
      )
      await prisma.userArea.createMany({
        data: upsertData,
        skipDuplicates: true,
      })
    }

    revalidatePaths(...SECTOR_PATHS)
    return { success: true as const }
  } catch (error) {
    return handleActionError(error, 'assignChiefToSectorAction', 'Error al asignar jefes al sector')
  }
}
