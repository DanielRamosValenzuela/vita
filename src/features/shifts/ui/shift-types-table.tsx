'use client'

import { type ReactNode, useCallback, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Edit, Trash2 } from 'lucide-react'

import { useClientPagination } from '@/src/shared/lib/hooks/use-client-pagination'
import { Button } from '@/src/shared/ui/button'
import { IconDisplay } from '@/src/shared/ui/icon-picker'
import { DataTablePagination } from '@/src/shared/ui/molecules/data-table-pagination'
import { DataTableToolbar } from '@/src/shared/ui/molecules/data-table-toolbar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/shared/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/shared/ui/table'

import { DEFAULT_SHIFT_TYPE_ICON, type ShiftType } from './shift-types-utils'

interface ShiftTypesTableProps {
  shiftTypes: ShiftType[]
  formatDuration: (mins: number) => string
  getStatusBadge: (isActive: boolean) => ReactNode
  onEdit: (shiftType: ShiftType) => void
  onDelete: (shiftType: ShiftType) => void
  isChief?: boolean
}

export function ShiftTypesTable({
  shiftTypes,
  formatDuration,
  getStatusBadge,
  onEdit,
  onDelete,
  isChief = false,
}: ShiftTypesTableProps) {
  const t = useTranslations('shifts.shiftTypes')
  const tFilters = useTranslations('common.filters')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [classFilter, setClassFilter] = useState<string>('all')

  const filterFn = useCallback(
    (st: ShiftType) => {
      if (statusFilter === 'active' && !st.isActive) return false
      if (statusFilter === 'inactive' && st.isActive) return false
      if (classFilter !== 'all' && st.classification !== classFilter) return false
      return true
    },
    [statusFilter, classFilter]
  )

  const { paginatedItems, page, totalPages, total, from, to, search, setSearch, setPage } =
    useClientPagination({
      items: shiftTypes,
      pageSize: 10,
      searchFn: (st, query) => st.name.toLowerCase().includes(query),
      filterFn,
    })

  return (
    <div className="space-y-4">
      <DataTableToolbar
        search={search}
        onSearchChange={setSearch}
        total={total}
        from={from}
        to={to}
      >
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="min-w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{tFilters('allStatuses')}</SelectItem>
            <SelectItem value="active">{tFilters('active')}</SelectItem>
            <SelectItem value="inactive">{tFilters('inactive')}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={classFilter} onValueChange={setClassFilter}>
          <SelectTrigger className="min-w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('filters.allClassifications')}</SelectItem>
            <SelectItem value="DAY">{t('classification.DAY')}</SelectItem>
            <SelectItem value="NIGHT">{t('classification.NIGHT')}</SelectItem>
            <SelectItem value="MIXED">{t('classification.MIXED')}</SelectItem>
          </SelectContent>
        </Select>
      </DataTableToolbar>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('table.name')}</TableHead>
            <TableHead>{t('table.icon')}</TableHead>
            <TableHead>{t('table.duration')}</TableHead>
            <TableHead>{t('table.classification')}</TableHead>
            <TableHead>{t('table.color')}</TableHead>
            <TableHead>{t('table.description')}</TableHead>
            <TableHead>{t('table.status')}</TableHead>
            <TableHead>{t('table.global')}</TableHead>
            <TableHead>{t('table.shiftsCount')}</TableHead>
            <TableHead>{t('table.areasCount')}</TableHead>
            <TableHead>{t('table.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedItems.map((shiftType) => (
          <TableRow key={shiftType.id}>
            <TableCell className="font-medium">{shiftType.name}</TableCell>
            <TableCell>
              <span style={{ color: shiftType.color }}>
                <IconDisplay iconName={shiftType.icon ?? DEFAULT_SHIFT_TYPE_ICON} size={18} />
              </span>
            </TableCell>
            <TableCell>{formatDuration(shiftType.durationMinutes)}</TableCell>
            <TableCell>{t(`classification.${shiftType.classification}`)}</TableCell>
            <TableCell>
              <span className="flex items-center gap-2">
                <span
                  className="w-4 h-4 rounded-full border shrink-0"
                  style={{ backgroundColor: shiftType.color }}
                  aria-hidden
                />
                <span className="text-xs text-muted-foreground">{shiftType.color}</span>
              </span>
            </TableCell>
            <TableCell>{shiftType.description || '-'}</TableCell>
            <TableCell>{getStatusBadge(shiftType.isActive)}</TableCell>
            <TableCell>
              <span className="text-muted-foreground text-sm">
                {shiftType.isGlobal ? t('table.globalYes') : t('table.globalNo')}
              </span>
            </TableCell>
            <TableCell>
              <span className="text-sm">{shiftType._count?.shifts || 0}</span>
            </TableCell>
            <TableCell>
              <span className="text-sm">
                {shiftType.isGlobal
                  ? '-'
                  : (shiftType._count?.areaShiftTypes ?? shiftType.areaShiftTypes?.length ?? 0)}
              </span>
            </TableCell>
            <TableCell>
              {isChief && shiftType.isGlobal ? (
                <span className="text-muted-foreground text-sm">{t('table.notAvailable')}</span>
              ) : (
                <span className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => onEdit(shiftType)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(shiftType)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </span>
              )}
            </TableCell>
          </TableRow>
        ))}
        </TableBody>
      </Table>
      <DataTablePagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )
}
