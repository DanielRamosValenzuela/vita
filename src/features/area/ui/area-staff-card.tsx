'use client'

import { useTranslations } from 'next-intl'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/shared/ui/card'
import { SearchableAddableList } from '@/src/shared/ui/molecules'

import type { StaffOption } from '../api/area-actions'
import type { AreaFormAction } from './area-edit-utils'

interface AreaStaffCardProps {
  staff: StaffOption[]
  selectedStaffIds: Set<string>
  dispatch: (action: AreaFormAction) => void
}

export function AreaStaffCard({ staff, selectedStaffIds, dispatch }: AreaStaffCardProps) {
  const t = useTranslations('adminHR.areas')

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('editForm.staff')}</CardTitle>
        <CardDescription>{t('editForm.staffDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        {staff.length === 0 ? (
          <p className="text-muted-foreground text-sm">{t('editForm.noStaffInOrg')}</p>
        ) : (
          <SearchableAddableList<StaffOption>
            items={staff}
            selectedIds={selectedStaffIds}
            onSelectionChange={(ids) => dispatch({ type: 'SET_STAFF', value: ids })}
            getItemId={(s) => s.id}
            getSearchableText={(s) => `${s.name} ${s.email} ${s.docNumber ?? ''}`.trim()}
            renderItem={(s) => (
              <span className="flex flex-col gap-0.5">
                <span className="font-medium">{s.name}</span>
                <span className="text-muted-foreground text-sm">{s.email}</span>
                {s.docNumber && (
                  <span className="text-muted-foreground text-xs">
                    {t('editForm.staffDocNumber')}: {s.docNumber}
                  </span>
                )}
              </span>
            )}
            searchPlaceholder={t('editForm.staffSearch')}
            emptyMessage={t('editForm.noStaffInArea')}
            noResultsMessage={t('editForm.noMatch')}
            selectedLabel={t('editForm.assignedStaffLabel')}
            removeItemAriaLabel={(s) => t('editForm.removeStaff', { name: s.name })}
          />
        )}
        <p className="text-muted-foreground mt-4 text-sm">
          {t('editForm.staffAssignedCount', { count: selectedStaffIds.size })}
        </p>
      </CardContent>
    </Card>
  )
}
