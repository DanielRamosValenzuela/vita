import { prisma } from '@/src/shared/lib/db'

export async function createFeedToken(
  userId: string,
  organizationId: string | null,
  token: string
) {
  await prisma.calendarFeedToken.deleteMany({
    where: { userId, organizationId },
  })

  return prisma.calendarFeedToken.create({
    data: {
      userId,
      organizationId,
      token,
      isActive: true,
    },
  })
}

export async function getFeedTokenByToken(token: string) {
  return prisma.calendarFeedToken.findUnique({
    where: { token, isActive: true },
  })
}

export async function getUserFeedTokens(userId: string) {
  return prisma.calendarFeedToken.findMany({
    where: { userId },
    include: {
      organization: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function revokeFeedToken(tokenId: string, userId: string) {
  return prisma.calendarFeedToken.updateMany({
    where: { id: tokenId, userId },
    data: { isActive: false },
  })
}
