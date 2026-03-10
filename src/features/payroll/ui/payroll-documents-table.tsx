'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { Download, MoreHorizontal, RefreshCw, Trash2 } from 'lucide-react'

import { formatCurrencyByCode } from '@/src/shared/lib/utils/format'
import { toastActionResult } from '@/src/shared/lib/utils/toast-action-result'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/src/shared/ui/alert-dialog'
import { Button } from '@/src/shared/ui/button'
import { Checkbox } from '@/src/shared/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/src/shared/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/shared/ui/table'
import {
  deletePayrollDocumentAction,
  regeneratePayrollDocumentAction,
} from '@/src/features/admin-hr/api/payroll-actions'
import { downloadPayrollDocumentAction } from '@/src/features/payroll/api/payroll-history-actions'

import type { PayrollDocumentSummary } from '@/src/entities/payroll/lib/types'

interface PayrollDocumentsTableProps {
  documents: PayrollDocumentSummary[]
  periodId: string
  currency: string
  isAdminHR: boolean
  onRefresh: () => void
}

export function PayrollDocumentsTable({
  documents,
  periodId,
  currency,
  isAdminHR,
  onRefresh,
}: PayrollDocumentsTableProps) {
  const t = useTranslations('payroll')
  const [isPending, startTransition] = useTransition()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)

  const handleDownload = (documentId: string) => {
    startTransition(async () => {
      const result = await downloadPayrollDocumentAction({ documentId })
      if (result.success && result.data) window.open(result.data.signedUrl, '_blank')
      else toastActionResult(result)
    })
  }

  const handleRegenerate = (userId: string) => {
    startTransition(async () => {
      const result = await regeneratePayrollDocumentAction({ periodId, userId })
      toastActionResult(result)
      if (result.success) onRefresh()
    })
  }

  const handleDelete = (documentId: string) => {
    setDeleteTarget(documentId)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    startTransition(async () => {
      const result = await deletePayrollDocumentAction({ documentId: deleteTarget })
      toastActionResult(result)
      setDeleteDialogOpen(false)
      setDeleteTarget(null)
      if (result.success) onRefresh()
    })
  }

  const handleBulkDelete = () => {
    setBulkDeleteOpen(true)
  }

  const confirmBulkDelete = () => {
    startTransition(async () => {
      await Promise.allSettled(
        [...selectedIds].map((docId) => deletePayrollDocumentAction({ documentId: docId }))
      )

      setSelectedIds(new Set())
      setBulkDeleteOpen(false)
      onRefresh()
    })
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)

      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === documents.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(documents.map((d) => d.id)))
  }

  if (documents.length === 0)
    return <p className="text-muted-foreground py-8 text-center">{t('documents.empty')}</p>

  return (
    <div className="space-y-4">
      {isAdminHR && selectedIds.size > 0 && (
        <div className="flex items-center gap-2">
          <Button variant="destructive" size="sm" onClick={handleBulkDelete} disabled={isPending}>
            <Trash2 className="mr-2 h-4 w-4" />
            {t('documents.deleteSelected')} ({selectedIds.size})
          </Button>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            {isAdminHR && (
              <TableHead className="w-10">
                <Checkbox
                  checked={selectedIds.size === documents.length}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
            )}
            <TableHead>{t('documents.employee')}</TableHead>
            <TableHead className="text-right">{t('documents.baseSalary')}</TableHead>
            <TableHead className="text-right">{t('documents.shiftsAmount')}</TableHead>
            <TableHead className="text-right">{t('documents.total')}</TableHead>
            <TableHead className="text-right">{t('documents.shiftsCount')}</TableHead>
            <TableHead>{t('documents.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => (
            <TableRow key={doc.id}>
              {isAdminHR && (
                <TableCell>
                  <Checkbox
                    checked={selectedIds.has(doc.id)}
                    onCheckedChange={() => toggleSelect(doc.id)}
                  />
                </TableCell>
              )}
              <TableCell>
                <div>
                  <p className="font-medium">{doc.userName}</p>
                  <p className="text-muted-foreground text-xs">{doc.userEmail}</p>
                </div>
              </TableCell>
              <TableCell className="text-right">
                {formatCurrencyByCode(doc.baseSalaryAmount, currency)}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrencyByCode(doc.shiftsAmount, currency)}
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrencyByCode(doc.totalAmount, currency)}
              </TableCell>
              <TableCell className="text-right">{doc.shiftsCount}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDownload(doc.id)}
                    disabled={isPending}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  {isAdminHR && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleRegenerate(doc.userId)}>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          {t('documents.regenerate')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(doc.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t('documents.delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirm.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('confirm.deleteDescription')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('~common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>{t('~common.delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {}
      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirm.deleteSelectedTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('confirm.deleteSelectedDescription', { count: selectedIds.size })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('~common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBulkDelete}>{t('~common.delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
