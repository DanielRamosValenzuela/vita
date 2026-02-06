'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { MapPin, X } from 'lucide-react'

import { Button } from '@/src/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/src/shared/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/shared/ui/select'
import { assignChiefToSingleAreaAction, removeChiefFromAreaAction } from '../api/area-actions'

interface ChiefAreaSelectorProps {
  chiefId: string
  chiefName: string
  currentAreas: Array<{ id: string; name: string }>
  availableAreas: Array<{ id: string; name: string }>
}

export function ChiefAreaSelector({
  chiefId,
  chiefName,
  currentAreas,
  availableAreas,
}: ChiefAreaSelectorProps) {
  const t = useTranslations('adminHR.organization.chiefs')
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [selectedAreaId, setSelectedAreaId] = useState<string>('')
  const [isPending, startTransition] = useTransition()

  const currentArea = currentAreas[0]

  async function handleAssign() {
    if (!selectedAreaId) return

    startTransition(async () => {
      const result = await assignChiefToSingleAreaAction(chiefId, selectedAreaId)
      if (result.success) {
        toast.success(result.message)
        setOpen(false)
        router.refresh()
      } else
        toast.error(result.error)
    })
  }

  async function handleRemove(areaId: string) {
    startTransition(async () => {
      const result = await removeChiefFromAreaAction(chiefId, areaId)
      if (result.success) {
        toast.success(result.message)
        router.refresh()
      } else
        toast.error(result.error)
    })
  }

  return (
    <div className="flex items-center gap-2">
      {currentArea ? (
        <>
          <span className="text-sm">{currentArea.name}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-destructive"
            onClick={() => handleRemove(currentArea.id)}
            disabled={isPending}
            title={t('table.removeArea')}
          >
            <X className="h-3 w-3" />
          </Button>
        </>
      ) : (
        <span className="text-muted-foreground text-sm">{t('table.noAreaAssigned')}</span>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" disabled={isPending}>
            <MapPin className="mr-1 h-3 w-3" />
            {currentArea ? t('table.changeArea') : t('table.assignArea')}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentArea ? t('assignAreaForm.titleChange') : t('assignAreaForm.titleAssign')}
            </DialogTitle>
            <DialogDescription>
              {t('assignAreaForm.description', { name: chiefName })}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('assignAreaForm.selectArea')}</label>
              <Select value={selectedAreaId} onValueChange={setSelectedAreaId}>
                <SelectTrigger>
                  <SelectValue placeholder={t('assignAreaForm.selectPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {availableAreas.map((area) => (
                    <SelectItem key={area.id} value={area.id}>
                      {area.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
                {t('assignAreaForm.cancel')}
              </Button>
              <Button onClick={handleAssign} disabled={!selectedAreaId || isPending}>
                {isPending ? t('assignAreaForm.assigning') : t('assignAreaForm.assign')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
