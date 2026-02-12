'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { Edit, Plus, Copy, Trash2, XCircle } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/src/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/shared/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/shared/ui/table'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/src/shared/ui/dialog'
import { Input } from '@/src/shared/ui/input'
import { cn } from '@/src/shared/lib/utils/cn'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/src/shared/ui/tooltip'

import type { ContractsPageData } from '../api/contract-actions'
import { deleteRateTemplateAction, duplicateRateTemplateAction } from '../api/rate-template-actions'
import {
  createContractAction,
  endContractAction,
  updateContractAction,
} from '../api/contract-actions'
import { RateTemplateForm } from './rate-template-form'

interface ContractsPageProps {
  data: ContractsPageData
  currency: 'CLP' | 'USD' | 'COP' | 'ARS' | 'MXN' | 'PEN' | 'EUR'
}

export function ContractsPage({ data, currency }: ContractsPageProps) {
  const t = useTranslations('adminHR.rates')
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [createTemplateOpen, setCreateTemplateOpen] = useState(false)
  const [editTemplateId, setEditTemplateId] = useState<string | null>(null)
  const [deleteTemplateTarget, setDeleteTemplateTarget] = useState<{
    id: string
    name: string
  } | null>(null)
  const [endContractTarget, setEndContractTarget] = useState<{
    id: string
    userName: string
  } | null>(null)
  const [createContractTarget, setCreateContractTarget] = useState<{
    userId: string
    userName: string
    hasActiveContract: boolean
    primaryAreaId: string | null
    mode: 'create' | 'add' | 'edit'
    contractId?: string
    currentRateTemplateId?: string
  } | null>(null)
  const [multipleContractWarningTarget, setMultipleContractWarningTarget] = useState<{
    userId: string
    userName: string
    primaryAreaId: string | null
  } | null>(null)
  const [viewContractsTarget, setViewContractsTarget] = useState<{
    userId: string
    userName: string
    contracts: ContractsPageData['staff'][number]['contracts']
  } | null>(null)
  const [selectedRateTemplateId, setSelectedRateTemplateId] = useState<string>('')
  const [rateFilter, setRateFilter] = useState('')

  async function handleDeleteTemplate() {
    if (!deleteTemplateTarget) return

    startTransition(async () => {
      const result = await deleteRateTemplateAction(deleteTemplateTarget.id)
      if (result.success) {
        toast.success(result.message)
        setDeleteTemplateTarget(null)
        router.refresh()
      } else
        toast.error(result.error)
    })
  }

  async function handleDuplicateTemplate(id: string, name: string) {
    startTransition(async () => {
      const newName = `${name} (copia)`
      const result = await duplicateRateTemplateAction(id, newName)
      if (result.success) {
        toast.success(result.message)
        router.refresh()
      } else
        toast.error(result.error)
    })
  }

  async function handleEndContract() {
    if (!endContractTarget) return

    startTransition(async () => {
      const result = await endContractAction(endContractTarget.id)
      if (result.success) {
        toast.success(result.message)
        setEndContractTarget(null)
        router.refresh()
      } else
        toast.error(result.error)
    })
  }

  async function handleCreateContract() {
    if (!createContractTarget || !selectedRateTemplateId) return

    startTransition(async () => {
      const result =
        createContractTarget.mode === 'edit' && createContractTarget.contractId
          ? await updateContractAction(createContractTarget.contractId, {
              rateTemplateId: selectedRateTemplateId,
            })
          : await createContractAction({
              userId: createContractTarget.userId,
              rateTemplateId: selectedRateTemplateId,
              areaId: createContractTarget.primaryAreaId || undefined,
            })

      if (result.success) {
        if (createContractTarget.mode === 'add')
          toast.warning(t('contract.multipleWarning'))

        toast.success(
          result.message ||
            t(createContractTarget.mode === 'edit' ? 'contract.edit' : 'contract.create')
        )
        setCreateContractTarget(null)
        setSelectedRateTemplateId('')
        router.refresh()
      } else
        toast.error(result.error || t('loadError'))
    })
  }

  const editingTemplate = data.rateTemplates.find((t) => t.id === editTemplateId)
  const filteredRateTemplates =
    rateFilter.trim().length === 0
      ? data.rateTemplates
      : data.rateTemplates.filter((template) =>
          template.name.toLowerCase().includes(rateFilter.toLowerCase())
        )

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('rateTemplates.title')}</CardTitle>
              <CardDescription>{t('rateTemplates.description')}</CardDescription>
            </div>
            <Button onClick={() => setCreateTemplateOpen(true)} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              {t('rateTemplates.create')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {data.rateTemplates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="mb-4">{t('rateTemplates.empty')}</p>
              <Button variant="outline" onClick={() => setCreateTemplateOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                {t('rateTemplates.create')}
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('rateTemplates.table.name')}</TableHead>
                    <TableHead>{t('rateTemplates.table.components')}</TableHead>
                    <TableHead>{t('rateTemplates.table.contracts')}</TableHead>
                    <TableHead className="w-[200px]">{t('rateTemplates.table.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.rateTemplates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{template.name}</div>
                          {template.description && (
                            <div className="text-sm text-muted-foreground">
                              {template.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {template.componentsCount} {t('rateTemplates.table.componentsCount')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {template._count.contracts > 0 ? (
                          <Badge>{template._count.contracts}</Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            {t('rateTemplates.table.noContracts')}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditTemplateId(template.id)}
                          >
                            <Edit className="mr-1 h-4 w-4" />
                            {t('rateTemplates.table.edit')}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDuplicateTemplate(template.id, template.name)}
                            disabled={isPending}
                          >
                            <Copy className="mr-1 h-4 w-4" />
                            {t('rateTemplates.table.duplicate')}
                          </Button>
                          {template._count.contracts === 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() =>
                                setDeleteTemplateTarget({
                                  id: template.id,
                                  name: template.name,
                                })
                              }
                            >
                              <Trash2 className="mr-1 h-4 w-4" />
                              {t('rateTemplates.table.delete')}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('staffTable.title')}</CardTitle>
          <CardDescription>{t('staffTable.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          {data.staff.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t('empty.noStaff')}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('staffTable.person')}</TableHead>
                    <TableHead>{t('staffTable.area')}</TableHead>
                    <TableHead>{t('staffTable.rateTemplate')}</TableHead>
                    <TableHead>{t('staffTable.status')}</TableHead>
                    <TableHead className="w-[100px]">{t('staffTable.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.staff.map((person) => {
                    const primaryContract = person.contracts[0] ?? null
                    const hasContract = !!primaryContract
                    const hasMultipleContracts = person.contracts.length > 1

                    return (
                    <TableRow key={person.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{person.name}</div>
                          <div className="text-sm text-muted-foreground">{person.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {primaryContract?.areaName ||
                          person.primaryAreaName || (
                            <span className="text-muted-foreground">-</span>
                          )}
                      </TableCell>
                      <TableCell>
                        {primaryContract ? (
                          <div className="space-y-1">
                            <div>{primaryContract.rateTemplateName}</div>
                            {primaryContract.customMultiplier && (
                              <div className="text-xs text-muted-foreground">
                                {t('staffTable.multiplierValue', { value: primaryContract.customMultiplier })}
                              </div>
                            )}
                            {hasMultipleContracts && (
                              <Button
                                variant="link"
                                size="sm"
                                className="h-auto px-0 text-xs"
                                onClick={() =>
                                  setViewContractsTarget({
                                    userId: person.id,
                                    userName: person.name,
                                    contracts: person.contracts,
                                  })
                                }
                              >
                                {t('staffTable.viewRates', { count: person.contracts.length })}
                              </Button>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">{t('empty.noContract')}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {hasContract ? (
                          <Badge variant="default">{t('staffTable.statusActive')}</Badge>
                        ) : (
                          <Badge variant="secondary">{t('staffTable.statusNoContract')}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          {hasContract && primaryContract && (
                            <>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      setCreateContractTarget({
                                        userId: person.id,
                                        userName: person.name,
                                        hasActiveContract: hasContract,
                                        primaryAreaId:
                                          primaryContract.areaId ?? person.primaryAreaId,
                                        mode: 'edit',
                                        contractId: primaryContract.id,
                                        currentRateTemplateId: primaryContract.rateTemplateId,
                                      })
                                      setSelectedRateTemplateId(
                                        primaryContract.rateTemplateId ?? ''
                                      )
                                      setRateFilter('')
                                    }}
                                    disabled={isPending}
                                    aria-label={t('contract.tooltips.edit')}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent sideOffset={4}>
                                  {t('contract.tooltips.edit')}
                                </TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive hover:text-destructive"
                                    onClick={() =>
                                      setEndContractTarget({
                                        id: primaryContract.id,
                                        userName: person.name,
                                      })
                                    }
                                    disabled={isPending}
                                    aria-label={t('contract.tooltips.end')}
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent sideOffset={4}>
                                  {t('contract.tooltips.end')}
                                </TooltipContent>
                              </Tooltip>

                            </>
                          )}

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  if (hasContract) {
                                    setMultipleContractWarningTarget({
                                      userId: person.id,
                                      userName: person.name,
                                      primaryAreaId: person.primaryAreaId,
                                    })
                                  } else {
                                    setCreateContractTarget({
                                      userId: person.id,
                                      userName: person.name,
                                      hasActiveContract: false,
                                      primaryAreaId: person.primaryAreaId,
                                      mode: 'create',
                                    })
                                    setSelectedRateTemplateId('')
                                    setRateFilter('')
                                  }
                                }}
                                disabled={isPending || data.rateTemplates.length === 0}
                              >
                                {hasContract ? t('contract.addAnother') : t('contract.create')}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent sideOffset={4}>
                              {hasContract
                                ? t('contract.tooltips.add')
                                : t('contract.tooltips.assign')}
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <RateTemplateForm
        open={createTemplateOpen}
        onOpenChange={setCreateTemplateOpen}
        currency={currency}
        mode="create"
      />

      {editTemplateId && editingTemplate && (
        <RateTemplateForm
          open={!!editTemplateId}
          onOpenChange={(open) => !open && setEditTemplateId(null)}
          currency={currency}
          existingTemplate={editingTemplate as never}
          mode="edit"
        />
      )}

      <AlertDialog
        open={!!deleteTemplateTarget}
        onOpenChange={(open) => !open && setDeleteTemplateTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('delete.templateTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTemplateTarget
                ? t('delete.templateDescription', { name: deleteTemplateTarget.name })
                : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>{t('delete.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDeleteTemplate()
              }}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? t('delete.deleting') : t('delete.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!endContractTarget}
        onOpenChange={(open) => !open && setEndContractTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('delete.contractTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {endContractTarget
                ? t('delete.contractDescription', { name: endContractTarget.userName })
                : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>{t('delete.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleEndContract()
              }}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? t('delete.deleting') : t('delete.endContract')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!multipleContractWarningTarget}
        onOpenChange={(open) => {
          if (!open)
            setMultipleContractWarningTarget(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('contract.multipleWarningTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('contract.multipleWarning')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isPending}
            >
              {t('delete.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isPending}
              onClick={(event) => {
                event.preventDefault()
                if (!multipleContractWarningTarget)
                  return

                setCreateContractTarget({
                  userId: multipleContractWarningTarget.userId,
                  userName: multipleContractWarningTarget.userName,
                  hasActiveContract: true,
                  primaryAreaId: multipleContractWarningTarget.primaryAreaId,
                  mode: 'add',
                })
                setSelectedRateTemplateId('')
                setRateFilter('')
                setMultipleContractWarningTarget(null)
              }}
            >
              {t('contract.multipleWarningConfirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={!!viewContractsTarget}
        onOpenChange={(open) => {
          if (!open)
            setViewContractsTarget(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {viewContractsTarget
                ? t('contract.viewAllTitle', { name: viewContractsTarget.userName })
                : ''}
            </DialogTitle>
            <DialogDescription>{t('contract.viewAllDescription')}</DialogDescription>
          </DialogHeader>

          {viewContractsTarget && (
            <div className="rounded-md border mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('staffTable.rateTemplate')}</TableHead>
                    <TableHead>{t('staffTable.area')}</TableHead>
                    <TableHead>{t('staffTable.multiplier')}</TableHead>
                    <TableHead className="w-[120px]">{t('staffTable.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {viewContractsTarget.contracts.map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell>{contract.rateTemplateName}</TableCell>
                      <TableCell>{contract.areaName || t('empty.noContract')}</TableCell>
                      <TableCell>
                        {contract.customMultiplier ? (
                          <Badge variant="secondary" className="text-xs">
                            {t('staffTable.multiplierValue', { value: contract.customMultiplier })}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">
                            {t('staffTable.multiplier')}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 justify-end">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setCreateContractTarget({
                                    userId: viewContractsTarget.userId,
                                    userName: viewContractsTarget.userName,
                                    hasActiveContract: true,
                                    primaryAreaId: contract.areaId,
                                    mode: 'edit',
                                    contractId: contract.id,
                                    currentRateTemplateId: contract.rateTemplateId,
                                  })
                                  setSelectedRateTemplateId(contract.rateTemplateId)
                                  setRateFilter('')
                                  setViewContractsTarget(null)
                                }}
                                disabled={isPending}
                                aria-label={t('contract.tooltips.edit')}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent sideOffset={4}>
                              {t('contract.tooltips.edit')}
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                onClick={() => {
                                  setEndContractTarget({
                                    id: contract.id,
                                    userName: viewContractsTarget.userName,
                                  })
                                  setViewContractsTarget(null)
                                }}
                                disabled={isPending}
                                aria-label={t('contract.tooltips.end')}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent sideOffset={4}>
                              {t('contract.tooltips.end')}
                            </TooltipContent>
                          </Tooltip>

                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!createContractTarget}
        onOpenChange={(open) => {
          if (!open) {
            setCreateContractTarget(null)
            setSelectedRateTemplateId('')
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {createContractTarget
                ? t('contract.createTitle', { name: createContractTarget.userName })
                : ''}
            </DialogTitle>
            <DialogDescription>{t('contract.createDescription')}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('contract.rateType')}</label>
              <Input
                value={rateFilter}
                onChange={(event) => setRateFilter(event.target.value)}
                placeholder={t('contract.searchRatePlaceholder')}
              />
                            <div className="rounded-md border max-h-60 overflow-y-auto">
                {filteredRateTemplates.length === 0 ? (
                  <p className="text-muted-foreground py-4 text-center text-sm">
                    {t('contract.noRatesFound')}
                  </p>
                ) : (
                  <ul className="divide-y" role="listbox" aria-label={t('contract.rateType')}>
                    {filteredRateTemplates.map((template) => {
                      const isSelected = template.id === selectedRateTemplateId
                      return (
                        <li key={template.id}>
                          <button
                            type="button"
                            onClick={() => setSelectedRateTemplateId(template.id)}
                            className={cn(
                              'w-full px-3 py-2 text-left text-sm transition-colors hover:bg-accent',
                              isSelected ? 'bg-accent' : ''
                            )}
                          >
                            <div className="font-medium">{template.name}</div>
                            {template.description && (
                              <div className="text-muted-foreground text-xs line-clamp-2">
                                {template.description}
                              </div>
                            )}
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            </div>

          </div>

          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setCreateContractTarget(null)
                setSelectedRateTemplateId('')
              }}
              disabled={isPending}
            >
              {t('templateForm.cancel')}
            </Button>
            <Button
              onClick={handleCreateContract}
              disabled={isPending || !selectedRateTemplateId}
            >
              {isPending ? t('templateForm.saving') : t('contract.create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
