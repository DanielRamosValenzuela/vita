'use client'

import { useTranslations } from 'next-intl'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/shared/ui/card'
import { SearchableAddableList } from '@/src/shared/ui/molecules'

import type { ChiefOption } from '../api/area-actions'
import type { AreaFormAction } from './area-edit-utils'

export interface AreaChiefsCardProps {
  canAssignChiefs: boolean
  chiefs: ChiefOption[]
  selectedChiefIds: Set<string>
  initialAssignedChiefIds: Set<string>
  dispatch: (action: AreaFormAction) => void
}

export function AreaChiefsCard({
  canAssignChiefs,
  chiefs,
  selectedChiefIds,
  initialAssignedChiefIds,
  dispatch,
}: AreaChiefsCardProps) {
  const t = useTranslations('adminHR.areas')

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('editForm.chiefs')}</CardTitle>
        <CardDescription>{t('editForm.chiefsDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        {canAssignChiefs ? (
          chiefs.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t('editForm.noChiefs')}</p>
          ) : (
            <SearchableAddableList<ChiefOption>
              items={chiefs}
              selectedIds={selectedChiefIds}
              onSelectionChange={(ids) => dispatch({ type: 'SET_CHIEFS', value: ids })}
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
          )
        ) : (
          <>
            <p className="text-muted-foreground mb-3 text-sm">
              {t('editForm.chiefsReadOnlyDescription')}
            </p>
            {chiefs.filter((c) => initialAssignedChiefIds.has(c.id)).length === 0 ? (
              <p className="text-muted-foreground text-sm">{t('editForm.noChiefsAssigned')}</p>
            ) : (
              <ul className="space-y-2" role="list">
                {chiefs
                  .filter((c) => initialAssignedChiefIds.has(c.id))
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
            count: canAssignChiefs ? selectedChiefIds.size : initialAssignedChiefIds.size,
          })}
        </p>
      </CardContent>
    </Card>
  )
}
