import { redirect } from 'next/navigation'
import { Role } from '@prisma/client'

import { requireAuth } from '@/src/shared/lib/auth'

import { RequestsPage } from '@/src/features/requests-dashboard/ui/requests-page'

export default async function RequestsRoute() {
  const user = await requireAuth()

  if (user.role === Role.SUPER_ADMIN) redirect('/dashboard')

  const isChiefOrAdmin =
    user.role === Role.ADMIN_HR ||
    user.role === Role.CHIEF_AREA ||
    user.role === Role.CHIEF_SECTOR

  return <RequestsPage showApprovals={isChiefOrAdmin} userRole={user.role} />
}
