'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { Check, X } from 'lucide-react'
import { toast } from 'sonner'

import { Spinner } from '@/src/shared/ui/atoms'
import { Badge } from '@/src/shared/ui/badge'
import { Button } from '@/src/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/shared/ui/card'
import { IconDisplay } from '@/src/shared/ui/icon-picker'
import { Input } from '@/src/shared/ui/input'

import { useRouter } from '@/i18n/navigation'

import { assignAreasToSectorAction } from '../api'

const DEFAULT_AREA_ICON = 'Building2'

interface AreaOption {
  id: string
  name: string
  icon: string | null
  color: string
}

interface SectorAreasCardProps {
  sectorId: string
  assignedAreas: AreaOption[]
  allAreas: AreaOption[]
  canAssignAreas?: boolean
}

export function SectorAreasCard({
  sectorId,
  assignedAreas,
  allAreas,
  canAssignAreas = true,
}: SectorAreasCardProps) {
  const t = useTranslations('adminHR.sectors')
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(assignedAreas.map((a) => a.id))
  )
  const [search, setSearch] = useState('')

  const initialIds = new Set(assignedAreas.map((a) => a.id))
  const hasChanges =
    selectedIds.size !== initialIds.size || [...selectedIds].some((id) => !initialIds.has(id))

  const filteredAreas = allAreas.filter(
    (area) => !selectedIds.has(area.id) && area.name.toLowerCase().includes(search.toLowerCase())
  )

  const toggleArea = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleSave = () => {
    startTransition(async () => {
      const result = await assignAreasToSectorAction(sectorId, [...selectedIds])
      if (result.success) {
        toast.success(t('editSuccess'))
        router.push('/dashboard/sectors')
      } else toast.error(result.error)
    })
  }

  const selectedAreas = allAreas.filter((a) => selectedIds.has(a.id))

  if (!canAssignAreas)
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('editForm.areas')}</CardTitle>
          <CardDescription>{t('editForm.areasReadOnlyDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          {assignedAreas.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t('editForm.noAreas')}</p>
          ) : (
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm">
                {t('editForm.assignedCount', { count: assignedAreas.length })}
              </p>
              <div className="flex flex-wrap gap-2">
                {assignedAreas.map((area) => (
                  <Badge
                    key={area.id}
                    variant="secondary"
                    className="flex items-center gap-1.5 py-1 px-2"
                  >
                    <span style={{ color: area.color }}>
                      <IconDisplay iconName={area.icon ?? DEFAULT_AREA_ICON} size={14} />
                    </span>
                    <span>{area.name}</span>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('editForm.areas')}</CardTitle>
        <CardDescription>{t('editForm.areasDescription')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {selectedAreas.length > 0 && (
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm">
              {t('editForm.assignedCount', { count: selectedAreas.length })}
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedAreas.map((area) => (
                <Badge
                  key={area.id}
                  variant="secondary"
                  className="flex items-center gap-1.5 py-1 pr-1 pl-2"
                >
                  <span style={{ color: area.color }}>
                    <IconDisplay iconName={area.icon ?? DEFAULT_AREA_ICON} size={14} />
                  </span>
                  <span>{area.name}</span>
                  <button
                    type="button"
                    onClick={() => toggleArea(area.id)}
                    className="hover:bg-muted ml-1 rounded-full p-0.5"
                    aria-label={t('editForm.removeArea', { name: area.name })}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Input
            placeholder={t('editForm.areasSearch')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {allAreas.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t('editForm.noAreas')}</p>
          ) : filteredAreas.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              {selectedIds.size === allAreas.length
                ? t('editForm.allAssigned')
                : t('editForm.noMatch')}
            </p>
          ) : (
            <div className="max-h-48 space-y-1 overflow-y-auto">
              {filteredAreas.map((area) => (
                <button
                  key={area.id}
                  type="button"
                  onClick={() => toggleArea(area.id)}
                  className="hover:bg-muted flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm"
                >
                  <span style={{ color: area.color }}>
                    <IconDisplay iconName={area.icon ?? DEFAULT_AREA_ICON} size={16} />
                  </span>
                  <span className="flex-1">{area.name}</span>
                  {selectedIds.has(area.id) && <Check className="text-primary h-4 w-4" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <Button onClick={handleSave} disabled={isPending || !hasChanges}>
          {isPending && <Spinner size="sm" className="mr-2" />}
          {isPending ? t('editForm.savingAreas') : t('editForm.saveAreas')}
        </Button>
      </CardContent>
    </Card>
  )
}
