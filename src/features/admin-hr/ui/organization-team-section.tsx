'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import type { Country, Role } from '@prisma/client'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { UserPlus } from 'lucide-react'
import { useRouter } from 'next/navigation'

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

import { InviteUserForm } from './invite-user-form'

interface OrganizationTeamSectionProps {
  organizationId: string
  organizationCountry: Country
  users: Array<{
    id: string
    name: string
    email: string
    createdAt: Date
  }>
  currentCount: number
  maxLimit: number
  translationNamespace: string
  allowedRoles: Array<{ value: Role; label: string }>
  defaultRole: Role
}

export function OrganizationTeamSection({
  organizationId,
  organizationCountry,
  users,
  currentCount,
  maxLimit,
  translationNamespace,
  allowedRoles,
  defaultRole,
}: OrganizationTeamSectionProps) {
  const t = useTranslations(translationNamespace)
  const router = useRouter()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  const canCreateMore = currentCount < maxLimit

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
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('table.name')}</TableHead>
                  <TableHead>{t('table.email')}</TableHead>
                  <TableHead>{t('table.createdAt')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {format(new Date(user.createdAt), 'dd MMM yyyy', { locale: es })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
