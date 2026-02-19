'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'

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
import { Switch } from '@/src/shared/ui/switch'

import type { AreaFormAction } from './area-edit-utils'

interface AreaStatusCardProps {
  isActive: boolean
  canActivate: boolean
  hasChanges: boolean
  isPending: boolean
  showSaveConfirm: boolean
  dispatch: (action: AreaFormAction) => void
  onPerformSave: () => void
}

export function AreaStatusCard({
  isActive,
  canActivate,
  hasChanges,
  isPending,
  showSaveConfirm,
  dispatch,
  onPerformSave,
}: AreaStatusCardProps) {
  const t = useTranslations('adminHR.areas')

  const handleToggleActive = (checked: boolean) => {
    if (checked && !canActivate) return
    dispatch({ type: 'SET_FIELD', field: 'isActive', value: checked })
  }

  const handleSave = () => {
    if (!hasChanges) return
    dispatch({ type: 'TOGGLE_SAVE_CONFIRM', value: true })
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('editForm.status')}</CardTitle>
              <CardDescription>
                {canActivate
                  ? t('editForm.statusDescription')
                  : t('editForm.statusDescriptionInactive')}
              </CardDescription>
            </div>
            <Switch
              checked={isActive}
              onCheckedChange={handleToggleActive}
              disabled={!canActivate}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Badge variant={isActive ? 'default' : 'secondary'}>
            {isActive ? t('status.active') : t('status.inactive')}
          </Badge>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button onClick={handleSave} disabled={!hasChanges || isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t('save')}
        </Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard/areas">{t('cancel')}</Link>
        </Button>
      </div>

      <AlertDialog
        open={showSaveConfirm}
        onOpenChange={(open) => dispatch({ type: 'TOGGLE_SAVE_CONFIRM', value: open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('saveConfirm.title')}</AlertDialogTitle>
            <AlertDialogDescription>{t('saveConfirm.description')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>{t('saveConfirm.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={onPerformSave} disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('saveConfirm.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
