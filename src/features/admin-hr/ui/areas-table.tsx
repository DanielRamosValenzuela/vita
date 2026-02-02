'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import Link from 'next/link'
import { Eye, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { deleteAreaAction } from '@/src/features/admin-hr/api'
import { renderIcon } from '@/src/shared/ui/icon-picker'
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/shared/ui/card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/src/shared/ui/tooltip'

interface AreasTableProps {
  areas: Array<{
    id: string
    name: string
    description: string | null
    icon: string | null
    color: string
    isActive: boolean
    _count?: { shiftTypes: number }
  }>
}

export function AreasTable({ areas }: AreasTableProps) {
  const t = useTranslations('adminHR.areas')
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)

  const handleDelete = () => {
    if (!deleteTarget) return

    startTransition(async () => {
      const result = await deleteAreaAction(deleteTarget.id)

      if (result.success) {
        toast.success(result.message)
        setDeleteTarget(null)
        router.refresh()
      } else toast.error(result.error)
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t('title')}</CardTitle>
            <CardDescription className="mt-1">{t('description')}</CardDescription>
          </div>
          <Button asChild>
            <Link href="/dashboard/areas/new">
              <Plus className="mr-2 h-4 w-4" />
              {t('new')}
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {areas.length === 0 ? (
          <div className="text-muted-foreground py-8 text-center">
            <p className="mb-4">{t('empty')}</p>
            <Button asChild variant="outline">
              <Link href="/dashboard/areas/new">{t('createFirst')}</Link>
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-muted-foreground pb-3 text-left text-sm font-medium">
                    {t('table.name')}
                  </th>
                  <th className="text-muted-foreground pb-3 text-left text-sm font-medium">
                    {t('table.description')}
                  </th>
                  <th className="text-muted-foreground pb-3 text-left text-sm font-medium">
                    {t('table.shiftTypes')}
                  </th>
                  <th className="text-muted-foreground pb-3 text-left text-sm font-medium">
                    {t('table.status')}
                  </th>
                  <th className="text-muted-foreground pb-3 text-right text-sm font-medium">
                    {t('table.actions')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {areas.map((area) => (
                  <tr key={area.id} className="border-b last:border-0">
                    <td className="py-4">
                      <span className="flex items-center gap-2">
                        <span style={{ color: area.color }}>
                          {renderIcon(area.icon ?? 'Building2', '', 18)}
                        </span>
                        <span className="font-medium">{area.name}</span>
                      </span>
                    </td>
                    <td className="text-muted-foreground py-4 text-sm">
                      {area.description || '-'}
                    </td>
                    <td className="py-4 text-sm">
                      {area._count?.shiftTypes ?? 0}
                    </td>
                    <td className="py-4">
                      <Badge variant={area.isActive ? 'default' : 'secondary'}>
                        {area.isActive ? t('status.active') : t('status.inactive')}
                      </Badge>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button asChild variant="ghost" size="sm">
                              <Link href={`/dashboard/areas/${area.id}/edit`}>
                                <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top">{t('table.view')}</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteTarget({ id: area.id, name: area.name })}
                              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                              aria-label={t('delete')}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top">{t('delete')}</TooltipContent>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteConfirm.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteConfirm.description', { name: deleteTarget?.name ?? '' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>{t('deleteConfirm.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? t('deleteConfirm.deleting') : t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
