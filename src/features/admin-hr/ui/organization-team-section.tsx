'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import type { Country, Role } from '@prisma/client'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { UserMinus, UserPlus } from 'lucide-react'
import { toast } from 'sonner'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/src/shared/ui/alert-dialog'
import { useClientPagination } from '@/src/shared/lib/hooks/use-client-pagination'
import { Button } from '@/src/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/shared/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/src/shared/ui/dialog'
import { DataTablePagination } from '@/src/shared/ui/molecules/data-table-pagination'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/shared/ui/table'

import { removeUserFromOrganizationAction } from '../api/invitation-actions'
import { ChiefAreaSelector } from './chief-area-selector'
import { InviteUserForm } from './invite-user-form'

interface OrganizationTeamSectionProps {
  organizationId: string
  organizationCountry: Country
  users: Array<{
    id: string
    name: string
    email: string
    createdAt: Date
    areas?: Array<{ id: string; name: string }>
  }>
  currentCount: number
  maxLimit: number
  translationNamespace: string
  allowedRoles: Array<{ value: Role; label: string }>
  defaultRole: Role
  showAreaColumn?: boolean
  showUnlinkButton?: boolean
  availableAreas?: Array<{ id: string; name: string }>
}

const EMPTY_AVAILABLE_AREAS: Array<{ id: string; name: string }> = []

export function OrganizationTeamSection({
  organizationId,
  organizationCountry,
  users,
  currentCount,
  maxLimit,
  translationNamespace,
  allowedRoles,
  defaultRole,
  showAreaColumn = false,
  showUnlinkButton = false,
  availableAreas = EMPTY_AVAILABLE_AREAS,
}: OrganizationTeamSectionProps) {
  const t = useTranslations(translationNamespace)
  const router = useRouter()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [unlinkTarget, setUnlinkTarget] = useState<{ id: string; name: string } | null>(null)
  const [isUnlinking, setIsUnlinking] = useState(false)

  const canCreateMore = currentCount < maxLimit

  const { paginatedItems: paginatedUsers, page, totalPages, setPage } = useClientPagination({
    items: users,
    pageSize: 10,
  })

  async function handleUnlink() {
    if (!unlinkTarget) return
    setIsUnlinking(true)
    try {
      const result = await removeUserFromOrganizationAction(unlinkTarget.id)
      if (result.success) {
        toast.success(result.message)
        setUnlinkTarget(null)
        router.refresh()
      } else toast.error(result.error)
    } finally {
      setIsUnlinking(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t('title')}</CardTitle>
            <CardDescription>
              {t('description', { current: currentCount, max: maxLimit })}
            </CardDescription>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={!canCreateMore} size="sm">
                <UserPlus className="mr-2 h-4 w-4" />
                {t('invite')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{t('inviteForm.title')}</DialogTitle>
                <DialogDescription>{t('inviteForm.description')}</DialogDescription>
              </DialogHeader>
              <InviteUserForm
                organizationId={organizationId}
                organizationCountry={organizationCountry}
                translationNamespace="adminHR.invitations.inviteForm"
                allowedRoles={allowedRoles}
                defaultRole={defaultRole}
                onSuccess={() => {
                  setCreateDialogOpen(false)
                  router.refresh()
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {!canCreateMore && (
          <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
            {t('limitReached')}
          </div>
        )}

        {users.length === 0 ? (
          <div className="text-muted-foreground py-8 text-center">
            <p className="mb-4">{t('empty')}</p>
            {canCreateMore && (
              <Button variant="outline" onClick={() => setCreateDialogOpen(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                {t('inviteFirst')}
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('table.name')}</TableHead>
                    <TableHead>{t('table.email')}</TableHead>
                    {showAreaColumn && <TableHead>{t('table.areaAssigned')}</TableHead>}
                    <TableHead>{t('table.createdAt')}</TableHead>
                    {showUnlinkButton && (
                      <TableHead className="w-[100px]">{t('table.actions')}</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      {showAreaColumn && (
                        <TableCell>
                          <ChiefAreaSelector
                            chiefId={user.id}
                            chiefName={user.name}
                            currentAreas={user.areas || []}
                            availableAreas={availableAreas}
                          />
                        </TableCell>
                      )}
                      <TableCell>
                        {format(new Date(user.createdAt), 'dd MMM yyyy', { locale: es })}
                      </TableCell>
                      {showUnlinkButton && (
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setUnlinkTarget({ id: user.id, name: user.name })}
                          >
                            <UserMinus className="mr-1 h-4 w-4" />
                            {t('table.unlink')}
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {totalPages > 1 && (
                <DataTablePagination page={page} totalPages={totalPages} onPageChange={setPage} />
              )}
            </div>

            <AlertDialog
              open={!!unlinkTarget}
              onOpenChange={(open) => !open && setUnlinkTarget(null)}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('unlinkConfirm.title')}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {unlinkTarget
                      ? t('unlinkConfirm.description', { name: unlinkTarget.name })
                      : ''}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isUnlinking}>
                    {t('unlinkConfirm.cancel')}
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={(e) => {
                      e.preventDefault()
                      handleUnlink()
                    }}
                    disabled={isUnlinking}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isUnlinking ? t('unlinkConfirm.unlinking') : t('unlinkConfirm.confirm')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </CardContent>
    </Card>
  )
}
