'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import type { Organization } from '@prisma/client'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Edit, Plus, Trash2, UserPlus } from 'lucide-react'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/shared/ui/table'

import { useRouter } from '@/i18n/navigation'

import { deleteAdminHRUserAction } from '../api/admin-hr-user-actions'
import { InviteAdminHRForm } from './invite-admin-hr-form'

interface OrganizationAdminHRSectionProps {
  organization: Organization
  adminHRUsers: Array<{
    id: string
    name: string
    email: string
    createdAt: Date
  }>
  currentCount: number
  maxLimit: number
}

export function OrganizationAdminHRSection({
  organization,
  adminHRUsers,
  currentCount,
  maxLimit,
}: OrganizationAdminHRSectionProps) {
  const t = useTranslations('superAdmin.organizationDetails.adminHR')
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string; name: string }>({
    open: false,
    id: '',
    name: '',
  })

  const handleDelete = (id: string, name: string) => {
    setDeleteDialog({ open: true, id, name })
  }

  const confirmDelete = () => {
    startTransition(async () => {
      const result = await deleteAdminHRUserAction(deleteDialog.id)

      if (result.success) {
        toast.success(t('deleteSuccess'))
        setDeleteDialog({ open: false, id: '', name: '' })
        router.refresh()
      } else toast.error(result.error || t('deleteError'))
    })
  }

  const canCreateMore = currentCount < maxLimit

  return (
    <>
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
                <InviteAdminHRForm
                  organizationId={organization.id}
                  organizationCountry={organization.country}
                  translationNamespace="superAdmin.organizationDetails.adminHR.inviteForm"
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

          {adminHRUsers.length === 0 ? (
            <div className="text-muted-foreground py-8 text-center">
              <p className="mb-4">{t('empty')}</p>
              {canCreateMore && (
                <Button variant="outline" onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t('inviteFirst')}
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('table.name')}</TableHead>
                    <TableHead>{t('table.email')}</TableHead>
                    <TableHead>{t('table.createdAt')}</TableHead>
                    <TableHead className="text-right">{t('table.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adminHRUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {format(new Date(user.createdAt), 'dd MMM yyyy', { locale: es })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/dashboard/admin-hr-users/${user.id}/edit`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(user.id, user.name)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteConfirm.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteConfirm.description', { name: deleteDialog.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('deleteConfirm.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('deleteConfirm.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
