'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { AlertTriangle, Plus, RefreshCw, Search, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { Alert, AlertDescription } from '@/src/shared/ui/alert'
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
import { Badge } from '@/src/shared/ui/badge'
import { Button } from '@/src/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/ui/card'
import { Input } from '@/src/shared/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/shared/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/shared/ui/table'

import { checkCoverageAlertsAction, deleteRotationAction, getRotationsAction } from '../api'
import type { CoverageAlert, RotationListItem } from '../types/rotation-types'
import { RotationDetailDialog } from './rotation-detail-dialog'
import { RotationFormDialog } from './rotation-form-dialog'

interface RotationsPageContentProps {
  initialRotations: RotationListItem[]
  initialTotal: number
  areas: Array<{ id: string; name: string }>
}

function getStatusVariant(status: string): 'default' | 'secondary' | 'outline' {
  if (status === 'ACTIVE') return 'default'
  if (status === 'DRAFT') return 'secondary'
  return 'outline'
}

export function RotationsPageContent({
  initialRotations,
  initialTotal,
  areas,
}: RotationsPageContentProps) {
  const t = useTranslations('rotations')

  const [rotations, setRotations] = useState<RotationListItem[]>(initialRotations)
  const [total, setTotal] = useState(initialTotal)
  const [searchTerm, setSearchTerm] = useState('')
  const [areaFilter, setAreaFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [rotationToDelete, setRotationToDelete] = useState<RotationListItem | null>(null)
  const [selectedRotationId, setSelectedRotationId] = useState<string | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [coverageAlerts, setCoverageAlerts] = useState<
    Array<{ rotationId: string; rotationName: string; alerts: CoverageAlert[] }>
  >([])

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchRotations = (search: string, area: string, status: string) => {
    startTransition(async () => {
      const result = await getRotationsAction({
        search: search || undefined,
        areaId: area || undefined,
        status: (status as 'DRAFT' | 'ACTIVE' | 'INACTIVE') || undefined,
      })

      if (result.success && result.data) {
        setRotations(result.data.rotations)
        setTotal(result.data.total)
      } else
        toast.error(result.error ?? t('loadError'))
    })
  }

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)

    if (debounceRef.current)
      clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(() => {
      fetchRotations(value, areaFilter, statusFilter)
    }, 300)
  }

  const handleAreaChange = (value: string) => {
    const next = value === 'all' ? '' : value
    setAreaFilter(next)
    fetchRotations(searchTerm, next, statusFilter)
  }

  const handleStatusChange = (value: string) => {
    const next = value === 'all' ? '' : value
    setStatusFilter(next)
    fetchRotations(searchTerm, areaFilter, next)
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current)
        clearTimeout(debounceRef.current)
    }
  }, [])

  useEffect(() => {
    checkCoverageAlertsAction().then((result) => {
      if (result.success && result.data)
        setCoverageAlerts(result.data)
    })
  }, [])

  const handleDelete = (deleteLinkedShifts: boolean) => {
    if (!rotationToDelete) return

    startTransition(async () => {
      const result = await deleteRotationAction(rotationToDelete.id, deleteLinkedShifts)

      if (result.success) {
        toast.success(t('detail.deleteSuccess'))
        setRotationToDelete(null)
        fetchRotations(searchTerm, areaFilter, statusFilter)
      } else
        toast.error(result.error ?? t('loadError'))
    })
  }

  const handleCreate = () => {
    setCreateOpen(true)
  }

  const handleRowClick = (rotation: RotationListItem) => {
    setSelectedRotationId(rotation.id)
    setDetailOpen(true)
  }

  return (
    <section className="space-y-6" aria-labelledby="rotations-heading">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h2 id="rotations-heading" className="text-2xl font-bold">
            {t('title')}
          </h2>
          <p className="text-muted-foreground mt-1">{t('description')}</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" aria-hidden />
          {t('createButton')}
        </Button>
      </header>

      {coverageAlerts.length > 0 && (
        <div className="space-y-2" role="region" aria-label={t('coverage.alertsTitle')}>
          {coverageAlerts.map((item) => (
            <Alert
              key={item.rotationId}
              variant={item.alerts.some((a) => a.severity === 'error') ? 'destructive' : 'default'}
            >
              <AlertTriangle className="h-4 w-4" aria-hidden />
              <AlertDescription>
                {t('coverage.alertSummary', {
                  name: item.rotationName,
                  messages: item.alerts.map((a) => a.message).join(', '),
                })}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-wrap items-center gap-3">
            <CardTitle className="mr-auto">{t('common.rotations')}</CardTitle>
            <div className="relative w-64">
              <Search
                className="text-muted-foreground absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2"
                aria-hidden
              />
              <Input
                className="pl-9"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder={t('list.searchPlaceholder')}
              />
            </div>
            <Select value={areaFilter || 'all'} onValueChange={handleAreaChange}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder={t('list.allAreas')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('list.allAreas')}</SelectItem>
                {areas.map((area) => (
                  <SelectItem key={area.id} value={area.id}>
                    {area.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter || 'all'} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder={t('list.allStatuses')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('list.allStatuses')}</SelectItem>
                <SelectItem value="DRAFT">{t('status.DRAFT')}</SelectItem>
                <SelectItem value="ACTIVE">{t('status.ACTIVE')}</SelectItem>
                <SelectItem value="INACTIVE">{t('status.INACTIVE')}</SelectItem>
              </SelectContent>
            </Select>
            {isPending && (
              <RefreshCw className="text-muted-foreground h-4 w-4 animate-spin" aria-hidden />
            )}
          </div>
        </CardHeader>

        <CardContent>
          {rotations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <RefreshCw className="text-muted-foreground mb-4 h-12 w-12" aria-hidden />
              <h3 className="text-lg font-medium">{t('empty')}</h3>
              <p className="text-muted-foreground mt-2 max-w-sm">{t('emptyDescription')}</p>
              <Button onClick={handleCreate} className="mt-6">
                <Plus className="mr-2 h-4 w-4" aria-hidden />
                {t('createButton')}
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('list.columns.name')}</TableHead>
                      <TableHead>{t('list.columns.area')}</TableHead>
                      <TableHead>{t('list.columns.pattern')}</TableHead>
                      <TableHead className="text-center">
                        {t('list.columns.groups')}
                      </TableHead>
                      <TableHead className="text-center">
                        {t('list.columns.members')}
                      </TableHead>
                      <TableHead className="text-center">
                        {t('list.columns.shifts')}
                      </TableHead>
                      <TableHead>{t('list.columns.status')}</TableHead>
                      <TableHead className="w-16 text-right">
                        {t('list.columns.actions')}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rotations.map((rotation) => (
                      <TableRow
                        key={rotation.id}
                        className="cursor-pointer"
                        onClick={() => handleRowClick(rotation)}
                      >
                        <TableCell className="font-medium">{rotation.name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {rotation.area.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground max-w-40 truncate">
                          {rotation.patternSummary}
                        </TableCell>
                        <TableCell className="text-center">{rotation._count.groups}</TableCell>
                        <TableCell className="text-center">{rotation.totalMembers}</TableCell>
                        <TableCell className="text-center">{rotation._count.shifts}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(rotation.status)}>
                            {t(`status.${rotation.status}`)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              setRotationToDelete(rotation)
                            }}
                            aria-label={t('detail.delete')}
                          >
                            <Trash2 className="h-4 w-4" aria-hidden />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <p className="text-muted-foreground mt-4 text-sm">
                {t('list.showing', { count: rotations.length, total })}
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <RotationDetailDialog
        rotationId={selectedRotationId}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onRotationUpdated={() => fetchRotations(searchTerm, areaFilter, statusFilter)}
      />

      <RotationFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        areas={areas}
        onCreated={() => {
          setCreateOpen(false)
          fetchRotations(searchTerm, areaFilter, statusFilter)
        }}
      />

      <AlertDialog
        open={rotationToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setRotationToDelete(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('detail.deleteConfirm')}</AlertDialogTitle>
            <AlertDialogDescription>{t('detail.deleteDescription')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
            <AlertDialogCancel disabled={isPending}>{t('form.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDelete(false)}
              disabled={isPending}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/80"
            >
              {t('detail.unlinkShifts')}
            </AlertDialogAction>
            <AlertDialogAction
              onClick={() => handleDelete(true)}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('detail.deleteShifts')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}
