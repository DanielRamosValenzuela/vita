'use client'

import { useTranslations } from 'next-intl'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/src/shared/ui/button'

interface DataTablePaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  disabled?: boolean
}

export function DataTablePagination({
  page,
  totalPages,
  onPageChange,
  disabled,
}: DataTablePaginationProps) {
  const t = useTranslations('common.pagination')

  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-4 pt-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page - 1)}
        disabled={disabled || page <= 1}
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        {t('previous')}
      </Button>
      <span className="text-muted-foreground text-sm">
        {t('page', { current: page, total: totalPages })}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page + 1)}
        disabled={disabled || page >= totalPages}
      >
        {t('next')}
        <ChevronRight className="ml-1 h-4 w-4" />
      </Button>
    </div>
  )
}
