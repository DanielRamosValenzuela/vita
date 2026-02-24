'use client'

import { useEffect, useReducer, useRef, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { AlertTriangle, Pencil, Plus, RefreshCw, Search, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { Link } from '@/i18n/navigation'

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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/src/shared/ui/tooltip'

import { checkCoverageAlertsAction, deleteRotationAction, getRotationsAction } from '../api'
import type { CoverageAlert, RotationListItem } from '../types/rotation-types'
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

interface PageState {
  rotations: RotationListItem[]
  total: number
  searchTerm: string
  areaFilter: string
  statusFilter: string
  rotationToDelete: RotationListItem | null
  createOpen: boolean
  coverageAlerts: Array<{ rotationId: string; rotationName: string; alerts: CoverageAlert[] }>
}

type PageAction =
  | { type: 'SET_DATA'; rotations: RotationListItem[]; total: number }
  | { type: 'SET_SEARCH'; searchTerm: string }
  | { type: 'SET_AREA_FILTER'; areaFilter: string }
  | { type: 'SET_STATUS_FILTER'; statusFilter: string }
  | { type: 'SET_DELETE'; rotation: RotationListItem | null }
  | { type: 'SET_CREATE_OPEN'; open: boolean }
  | { type: 'SET_ALERTS'; alerts: PageState['coverageAlerts'] }

function pageReducer(state: PageState, action: PageAction): PageState {
  switch (action.type) {
    case 'SET_DATA':
      return { ...state, rotations: action.rotations, total: action.total }
    case 'SET_SEARCH':
      return { ...state, searchTerm: action.searchTerm }
    case 'SET_AREA_FILTER':
      return { ...state, areaFilter: action.areaFilter }
    case 'SET_STATUS_FILTER':
      return { ...state, statusFilter: action.statusFilter }
    case 'SET_DELETE':
      return { ...state, rotationToDelete: action.rotation }
    case 'SET_CREATE_OPEN':
      return { ...state, createOpen: action.open }
    case 'SET_ALERTS':
      return { ...state, coverageAlerts: action.alerts }
    default:
      return state
  }
}

type PageInit = { initialRotations: RotationListItem[]; initialTotal: number }

function initPage(init: PageInit): PageState {
  return {
    rotations: init.initialRotations,
    total: init.initialTotal,
    searchTerm: '',
    areaFilter: '',
    statusFilter: '',
    rotationToDelete: null,
    createOpen: false,
    coverageAlerts: [],
  }
}

interface RotationsTableProps {
  rotations: RotationListItem[]
  total: number
  onDelete: (rotation: RotationListItem) => void
  onCreate: () => void
  t: ReturnType<typeof useTranslations<'rotations'>>
}

function RotationsTable({ rotations, total, onDelete, onCreate, t }: RotationsTableProps) {
  if (rotations.length === 0)
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <RefreshCw className="text-muted-foreground mb-4 h-12 w-12" aria-hidden />
        <h3 className="text-lg font-medium">{t('empty')}</h3>
        <p className="text-muted-foreground mt-2 max-w-sm">{t('emptyDescription')}</p>
        <Button onClick={onCreate} className="mt-6">
          <Plus className="mr-2 h-4 w-4" aria-hidden />
          {t('createButton')}
        </Button>
      </div>
    )

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('list.columns.name')}</TableHead>
              <TableHead>{t('list.columns.area')}</TableHead>
              <TableHead>{t('list.columns.pattern')}</TableHead>
              <TableHead className="text-center">{t('list.columns.groups')}</TableHead>
              <TableHead className="text-center">{t('list.columns.members')}</TableHead>
              <TableHead className="text-center">{t('list.columns.shifts')}</TableHead>
              <TableHead>{t('list.columns.status')}</TableHead>
              <TableHead className="w-24 text-right">{t('list.columns.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rotations.map((rotation) => (
              <TableRow key={rotation.id} className="hover:bg-transparent">
                <TableCell className="font-medium">{rotation.name}</TableCell>
                <TableCell className="text-muted-foreground">{rotation.area.name}</TableCell>
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
                  <div className="flex items-center justify-end gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link href={`/dashboard/rotations/${rotation.id}`}>
                          <Button variant="ghost" size="icon" aria-label={t('detail.view')}>
                            <Pencil className="h-4 w-4" aria-hidden />
                          </Button>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent>{t('detail.view')}</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(rotation)}
                          aria-label={t('detail.delete')}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{t('detail.delete')}</TooltipContent>
                    </Tooltip>
                  </div>
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
  )
}

interface DeleteRotationDialogProps {
  rotation: RotationListItem | null
  isPending: boolean
  onClose: () => void
  onDelete: (deleteLinkedShifts: boolean) => void
  t: ReturnType<typeof useTranslations<'rotations'>>
}

function DeleteRotationDialog({ rotation, isPending, onClose, onDelete, t }: DeleteRotationDialogProps) {
  return (
    <AlertDialog
      open={rotation !== null}
      onOpenChange={(open) => {
        if (!open) onClose()
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
            onClick={() => onDelete(false)}
            disabled={isPending}
            className="bg-secondary text-secondary-foreground hover:bg-secondary/80"
          >
            {t('detail.unlinkShifts')}
          </AlertDialogAction>
          <AlertDialogAction
            onClick={() => onDelete(true)}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {t('detail.deleteShifts')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function RotationsPageContent({
  initialRotations,
  initialTotal,
  areas,
}: RotationsPageContentProps) {
  const t = useTranslations('rotations')
  const [state, dispatch] = useReducer(pageReducer, { initialRotations, initialTotal }, initPage)
  const [isPending, startTransition] = useTransition()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchRotations = (search: string, area: string, status: string) => {
    startTransition(async () => {
      const result = await getRotationsAction({
        search: search || undefined,
        areaId: area || undefined,
        status: (status as 'DRAFT' | 'ACTIVE' | 'INACTIVE') || undefined,
      })

      if (result.success && result.data)
        dispatch({ type: 'SET_DATA', rotations: result.data.rotations, total: result.data.total })
      else
        toast.error(result.error ?? t('loadError'))
    })
  }

  const handleSearchChange = (value: string) => {
    dispatch({ type: 'SET_SEARCH', searchTerm: value })

    if (debounceRef.current)
      clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(() => {
      fetchRotations(value, state.areaFilter, state.statusFilter)
    }, 300)
  }

  const handleAreaChange = (value: string) => {
    const next = value === 'all' ? '' : value
    dispatch({ type: 'SET_AREA_FILTER', areaFilter: next })
    fetchRotations(state.searchTerm, next, state.statusFilter)
  }

  const handleStatusChange = (value: string) => {
    const next = value === 'all' ? '' : value
    dispatch({ type: 'SET_STATUS_FILTER', statusFilter: next })
    fetchRotations(state.searchTerm, state.areaFilter, next)
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
        dispatch({ type: 'SET_ALERTS', alerts: result.data })
    })
  }, [])

  const handleDelete = (deleteLinkedShifts: boolean) => {
    const toDelete = state.rotationToDelete
    if (!toDelete) return

    startTransition(async () => {
      const result = await deleteRotationAction(toDelete.id, deleteLinkedShifts)

      if (result.success) {
        toast.success(t('detail.deleteSuccess'))
        dispatch({ type: 'SET_DELETE', rotation: null })
        fetchRotations(state.searchTerm, state.areaFilter, state.statusFilter)
      } else
        toast.error(result.error ?? t('loadError'))
    })
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
        <Button onClick={() => dispatch({ type: 'SET_CREATE_OPEN', open: true })}>
          <Plus className="mr-2 h-4 w-4" aria-hidden />
          {t('createButton')}
        </Button>
      </header>

      {state.coverageAlerts.length > 0 && (
        <div className="space-y-2" role="region" aria-label={t('coverage.alertsTitle')}>
          {state.coverageAlerts.map((item) => (
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
                value={state.searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder={t('list.searchPlaceholder')}
              />
            </div>
            <Select value={state.areaFilter || 'all'} onValueChange={handleAreaChange}>
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
            <Select value={state.statusFilter || 'all'} onValueChange={handleStatusChange}>
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
          <RotationsTable
            rotations={state.rotations}
            total={state.total}
            onDelete={(rotation) => dispatch({ type: 'SET_DELETE', rotation })}
            onCreate={() => dispatch({ type: 'SET_CREATE_OPEN', open: true })}
            t={t}
          />
        </CardContent>
      </Card>

      <RotationFormDialog
        open={state.createOpen}
        onOpenChange={(open) => dispatch({ type: 'SET_CREATE_OPEN', open })}
        areas={areas}
        onCreated={() => {
          dispatch({ type: 'SET_CREATE_OPEN', open: false })
          fetchRotations(state.searchTerm, state.areaFilter, state.statusFilter)
        }}
      />

      <DeleteRotationDialog
        rotation={state.rotationToDelete}
        isPending={isPending}
        onClose={() => dispatch({ type: 'SET_DELETE', rotation: null })}
        onDelete={handleDelete}
        t={t}
      />
    </section>
  )
}
