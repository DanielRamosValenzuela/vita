'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { Spinner } from '@/src/shared/ui/atoms'
import { Button } from '@/src/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/shared/ui/card'
import { SearchableAddableList } from '@/src/shared/ui/molecules'

import { useRouter } from '@/i18n/navigation'

import { assignChiefToSectorAction, type ChiefSectorOption } from '../api'

interface SectorChiefsCardProps {
  sectorId: string
  canAssignChiefs: boolean
  chiefs: ChiefSectorOption[]
  assignedChiefIds: string[]
}

export function SectorChiefsCard({
  sectorId,
  canAssignChiefs,
  chiefs,
  assignedChiefIds,
}: SectorChiefsCardProps) {
  const t = useTranslations('adminHR.sectors')
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(assignedChiefIds))

  const initialIds = new Set(assignedChiefIds)
  const hasChanges =
    selectedIds.size !== initialIds.size || [...selectedIds].some((id) => !initialIds.has(id))

  const handleSave = () => {
    startTransition(async () => {
      const result = await assignChiefToSectorAction(sectorId, [...selectedIds])
      if (result.success) {
        toast.success(t('editForm.chiefsSuccess'))
        router.push('/dashboard/sectors')
      } else toast.error(result.error)
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('editForm.chiefs')}</CardTitle>
        <CardDescription>
          {canAssignChiefs
            ? t('editForm.chiefsDescription')
            : t('editForm.chiefsReadOnlyDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {canAssignChiefs ? (
          chiefs.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t('editForm.noChiefs')}</p>
          ) : (
            <div className="space-y-4">
              <SearchableAddableList<ChiefSectorOption>
                items={chiefs}
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                getItemId={(c) => c.id}
                getSearchableText={(c) => `${c.name} ${c.email} ${c.docNumber ?? ''}`.trim()}
                renderItem={(c) => (
                  <span className="flex flex-col gap-0.5">
                    <span className="font-medium">{c.name}</span>
                    <span className="text-muted-foreground text-sm">{c.email}</span>
                    {c.docNumber && (
                      <span className="text-muted-foreground text-xs">
                        {t('editForm.chiefDocNumber')}: {c.docNumber}
                      </span>
                    )}
                  </span>
                )}
                searchPlaceholder={t('editForm.chiefsSearch')}
                emptyMessage={t('editForm.noChiefs')}
                noResultsMessage={t('editForm.noMatch')}
                selectedLabel={t('editForm.assignedChiefsLabel')}
                removeItemAriaLabel={(c) => t('editForm.removeChief', { name: c.name })}
              />
              <Button onClick={handleSave} disabled={isPending || !hasChanges}>
                {isPending && <Spinner size="sm" className="mr-2" />}
                {isPending ? t('editForm.savingChiefs') : t('editForm.saveChiefs')}
              </Button>
            </div>
          )
        ) : (
          <>
            {chiefs.filter((c) => initialIds.has(c.id)).length === 0 ? (
              <p className="text-muted-foreground text-sm">{t('editForm.noChiefsAssigned')}</p>
            ) : (
              <ul className="space-y-2" role="list">
                {chiefs
                  .filter((c) => initialIds.has(c.id))
                  .map((c) => (
                    <li
                      key={c.id}
                      className="flex flex-col gap-0.5 rounded-lg border bg-muted/30 px-3 py-2 text-sm"
                    >
                      <span className="font-medium">{c.name}</span>
                      <span className="text-muted-foreground text-xs">{c.email}</span>
                      {c.docNumber && (
                        <span className="text-muted-foreground text-xs">
                          {t('editForm.chiefDocNumber')}: {c.docNumber}
                        </span>
                      )}
                    </li>
                  ))}
              </ul>
            )}
          </>
        )}
        <p className="text-muted-foreground mt-4 text-sm">
          {t('editForm.chiefsAssignedCount', {
            count: canAssignChiefs ? selectedIds.size : initialIds.size,
          })}
        </p>
      </CardContent>
    </Card>
  )
}
