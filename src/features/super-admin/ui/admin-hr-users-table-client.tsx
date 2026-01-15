'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import type { Organization, User } from '@prisma/client'
import { Edit, Plus, Trash2 } from 'lucide-react'
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
import { Badge } from '@/src/shared/ui/badge'
import { Button } from '@/src/shared/ui/button'
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

interface AdminHRUserWithOrganization extends User {
  organization: Organization | null
}

interface AdminHRUsersTableClientProps {
  users: AdminHRUserWithOrganization[]
}

export function AdminHRUsersTableClient({ users }: AdminHRUsersTableClientProps) {
  const t = useTranslations('superAdmin.adminHRUsers')
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

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
      } else {
        toast.error(result.error || t('deleteError'))
      }
    })
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{t('title')}</h2>
            <p className="text-muted-foreground mt-1">{t('description')}</p>
          </div>
          <Button onClick={() => router.push('/dashboard/admin-hr-users/new')}>
            <Plus className="mr-2 h-4 w-4" />
            {t('new')}
          </Button>
        </div>

        {users.length === 0 ? (
          <div className="text-muted-foreground rounded-lg border p-8 text-center">
            <p className="mb-4">{t('empty')}</p>
            <Button variant="outline" onClick={() => router.push('/dashboard/admin-hr-users/new')}>
              {t('createFirst')}
            </Button>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('table.name')}</TableHead>
                  <TableHead>{t('table.email')}</TableHead>
                  <TableHead>{t('table.organization')}</TableHead>
                  <TableHead>{t('table.createdAt')}</TableHead>
                  <TableHead className="text-right">{t('table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {user.organization ? (
                        <Badge variant="outline">{user.organization.name}</Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">Sin organización</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
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
      </div>

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
