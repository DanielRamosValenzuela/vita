import { randomUUID } from 'crypto'

import { env } from '@/src/shared/config/env.server'

export function generateFeedToken(): string {
  return randomUUID()
}

export function buildFeedUrl(token: string): string {
  return `${env.NEXTAUTH_URL}/api/ical/${token}`
}
