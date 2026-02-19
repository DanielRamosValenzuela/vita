'use client'

import type { NotificationType } from '@prisma/client'
import { useTranslations } from 'next-intl'

import { Button } from '@/src/shared/ui/button'

type StatusFilter = 'all' | 'unread' | 'read'

interface TypeGroup {
  key: string
  types: NotificationType[]
}

export const TYPE_GROUPS: TypeGroup[] = [
  { key: 'INVITATION_PENDING', types: ['INVITATION_PENDING'] },
  { key: 'SHIFTS', types: ['SHIFT_CREATED', 'SHIFT_UPDATED', 'SHIFT_CANCELLED'] },
  { key: 'AREA_ASSIGNED', types: ['AREA_ASSIGNED'] },
  { key: 'GENERAL', types: ['GENERAL'] },
]

interface InboxFiltersProps {
  statusFilter: StatusFilter
  selectedTypeKeys: string[]
  onStatusChange: (filter: StatusFilter) => void
  onTypeKeysChange: (keys: string[]) => void
}

const STATUS_OPTIONS: StatusFilter[] = ['all', 'unread', 'read']

export function InboxFilters({
  statusFilter,
  selectedTypeKeys,
  onStatusChange,
  onTypeKeysChange,
}: InboxFiltersProps) {
  const t = useTranslations('notifications')

  const handleTypeToggle = (key: string) => {
    if (selectedTypeKeys.includes(key))
      onTypeKeysChange(selectedTypeKeys.filter((k) => k !== key))
    else
      onTypeKeysChange([...selectedTypeKeys, key])
  }

  const allSelected = selectedTypeKeys.length === 0

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1">
        {STATUS_OPTIONS.map((option) => (
          <Button
            key={option}
            variant={statusFilter === option ? 'default' : 'outline'}
            size="sm"
            onClick={() => onStatusChange(option)}
          >
            {t(`inbox.filters.${option}`)}
          </Button>
        ))}
      </div>
      <div className="flex flex-wrap gap-1">
        <Button
          variant={allSelected ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => onTypeKeysChange([])}
        >
          {t('inbox.typeFilters.all')}
        </Button>
        {TYPE_GROUPS.map((group) => (
          <Button
            key={group.key}
            variant={selectedTypeKeys.includes(group.key) ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => handleTypeToggle(group.key)}
          >
            {t(`inbox.typeFilters.${group.key}`)}
          </Button>
        ))}
      </div>
    </div>
  )
}
