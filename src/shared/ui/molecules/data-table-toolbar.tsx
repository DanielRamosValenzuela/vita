'use client'

import type { ReactNode } from 'react'
import { useTranslations } from 'next-intl'
import { Search } from 'lucide-react'

import { Input } from '@/src/shared/ui/input'

interface DataTableToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  total: number
  from: number
  to: number
  children?: ReactNode
}

export function DataTableToolbar({
  search,
  onSearchChange,
  searchPlaceholder,
  total,
  from,
  to,
  children,
}: DataTableToolbarProps) {
  const t = useTranslations('common.pagination')
  const placeholder = searchPlaceholder ?? t('searchPlaceholder')

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <div className="relative w-full max-w-sm">
          <Search className="text-muted-foreground absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2" />
          <Input
            type="search"
            placeholder={placeholder}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>
        {children}
      </div>
      {total > 0 && (
        <p className="text-muted-foreground shrink-0 text-sm">
          {t('showing', { from, to, total })}
        </p>
      )}
    </div>
  )
}
