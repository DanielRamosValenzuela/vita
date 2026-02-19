'use client'

import type { ReactNode } from 'react'
import { useTranslations } from 'next-intl'
import { Edit, Trash2 } from 'lucide-react'

import { Button } from '@/src/shared/ui/button'
import { IconDisplay } from '@/src/shared/ui/icon-picker'
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
}

export function ShiftTypesTable({
  shiftTypes,
  formatDuration,
  getStatusBadge,
  onEdit,
  onDelete,
}: ShiftTypesTableProps) {
  const t = useTranslations('shifts.shiftTypes')

  return (
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
        {shiftTypes.map((shiftType) => (
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
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
