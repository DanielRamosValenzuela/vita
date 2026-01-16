import type { OrganizationInvitation, Role } from '@prisma/client'

import { prisma } from '@/src/shared/lib/auth/config'
import type { ActionResult } from '@/src/shared/lib/types'

interface InvitationWithUser extends OrganizationInvitation {
  user: {
    id: string
    name: string
    email: string
    docNumber?: string | null
  }
  organization?: {
    id: string
    name: string
  }
}

export async function getAllInvitationsForOrganization(
  organizationId: string,
  role?: Role
): Promise<InvitationWithUser[]> {
  return await prisma.organizationInvitation.findMany({
    where: {
      organizationId,
      role: role || undefined,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          docNumber: true,
        },
      },
      organization: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getPendingInvitationsForOrganization(
  organizationId: string,
  role?: Role
): Promise<InvitationWithUser[]> {
  return await prisma.organizationInvitation.findMany({
    where: {
      organizationId,
      role: role || undefined,
      status: 'PENDING',
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          docNumber: true,
        },
      },
      organization: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getPendingInvitationsForUser(
  userId: string
): Promise<InvitationWithUser[]> {
  return await prisma.organizationInvitation.findMany({
    where: {
      userId,
      status: 'PENDING',
    },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          docNumber: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}

export async function createInvitation(
  organizationId: string,
  userId: string,
  role: Role,
  invitedBy: string
): Promise<ActionResult<OrganizationInvitation>> {
  try {
    const existingInvitation = await prisma.organizationInvitation.findUnique({
      where: {
        organizationId_userId_role: {
          organizationId,
          userId,
          role,
        },
      },
    })

    if (existingInvitation) {
      if (existingInvitation.status === 'PENDING') {
        return {
          success: false,
          error: 'Ya existe una invitación pendiente para este usuario',
        }
      }
      if (existingInvitation.status === 'ACCEPTED') {
        return {
          success: false,
          error: 'Este usuario ya tiene este rol en esta organización',
        }
      }
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
        organizationId: true,
      },
    })

    if (!user) {
      return { success: false, error: 'Usuario no encontrado' }
    }

    if (user.role === role && user.organizationId === organizationId) {
      return {
        success: false,
        error: 'Este usuario ya tiene este rol en esta organización',
      }
    }

    const invitation = await prisma.organizationInvitation.create({
      data: {
        organizationId,
        userId,
        role,
        invitedBy,
        status: 'PENDING',
      },
    })

    return { success: true, data: invitation }
  } catch (error) {
    console.error('[createInvitation] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al crear la invitación',
    }
  }
}

export async function deleteInvitation(
  invitationId: string
): Promise<ActionResult<{ organizationId: string }>> {
  try {
    const invitation = await prisma.organizationInvitation.findUnique({
      where: { id: invitationId },
      select: { status: true, organizationId: true },
    })

    if (!invitation) {
      return { success: false, error: 'Invitación no encontrada' }
    }

    if (invitation.status === 'ACCEPTED') {
      return { success: false, error: 'No se puede cancelar una invitación ya aceptada' }
    }

    await prisma.organizationInvitation.delete({
      where: { id: invitationId },
    })

    return { success: true, data: { organizationId: invitation.organizationId } }
  } catch (error) {
    console.error('[deleteInvitation] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al cancelar la invitación',
    }
  }
}

export async function acceptInvitation(
  invitationId: string,
  userId: string
): Promise<ActionResult<unknown>> {
  try {
    const invitation = await prisma.organizationInvitation.findUnique({
      where: { id: invitationId },
    })

    if (!invitation) {
      return { success: false, error: 'Invitación no encontrada' }
    }

    if (invitation.userId !== userId) {
      return { success: false, error: 'No tienes permiso para aceptar esta invitación' }
    }

    if (invitation.status !== 'PENDING') {
      return { success: false, error: 'Esta invitación ya fue procesada' }
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { docNumber: true, country: true },
    })

    if (!user?.docNumber || !user?.country) {
      return {
        success: false,
        error: 'Debes completar tu número de documento antes de aceptar la invitación',
      }
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          role: invitation.role,
          organizationId: invitation.organizationId,
        },
      }),
      prisma.organizationInvitation.update({
        where: { id: invitationId },
        data: {
          status: 'ACCEPTED',
          acceptedAt: new Date(),
        },
      }),
    ])

    return { success: true }
  } catch (error) {
    console.error('[acceptInvitation] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al aceptar la invitación',
    }
  }
}

export async function rejectInvitation(
  invitationId: string,
  userId: string
): Promise<ActionResult<unknown>> {
  try {
    const invitation = await prisma.organizationInvitation.findUnique({
      where: { id: invitationId },
    })

    if (!invitation) {
      return { success: false, error: 'Invitación no encontrada' }
    }

    if (invitation.userId !== userId) {
      return { success: false, error: 'No tienes permiso para rechazar esta invitación' }
    }

    if (invitation.status !== 'PENDING') {
      return { success: false, error: 'Esta invitación ya fue procesada' }
    }

    await prisma.organizationInvitation.update({
      where: { id: invitationId },
      data: {
        status: 'REJECTED',
      },
    })

    return { success: true }
  } catch (error) {
    console.error('[rejectInvitation] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al rechazar la invitación',
    }
  }
}

export type { InvitationWithUser }
