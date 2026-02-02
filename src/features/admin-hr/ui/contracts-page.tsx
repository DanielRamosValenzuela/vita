'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { Edit, FileText, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { formatCurrency } from '@/src/shared/lib/utils/format'
import { Badge } from '@/src/shared/ui/badge'
import { Button } from '@/src/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/shared/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/src/shared/ui/dialog'
import { Input } from '@/src/shared/ui/input'
import { Label } from '@/src/shared/ui/label'
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

import {
  createContractAction,
  createRateTemplateAction,
  deleteRateTemplateAction,
  endContractAction,
  updateContractAction,
  updateRateTemplateAction,
} from '../api'
import type {
  ContractsPageData,
  StaffWithContract,
} from '../api/contract-actions'

interface ContractsPageProps {
  data: ContractsPageData
}

export function ContractsPage({ data }: ContractsPageProps) {
  const t = useTranslations('adminHR.rates')
  const tCommon = useTranslations('common')
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [contractDialogOpen, setContractDialogOpen] = useState(false)
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false)
  const [endContractDialogOpen, setEndContractDialogOpen] = useState(false)
  const [deleteTemplateDialogOpen, setDeleteTemplateDialogOpen] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<StaffWithContract | null>(null)
  const [selectedContract, setSelectedContract] = useState<StaffWithContract['contract'] | null>(null)
  const [deleteTemplateTarget, setDeleteTemplateTarget] = useState<{
    id: string
    name: string
    contractsCount: number
  } | null>(null)
  const [templateForm, setTemplateForm] = useState<{
    id: string | null
    name: string
    ratePerMinute: string
    baseSalary: string
  }>({ id: null, name: '', ratePerMinute: '', baseSalary: '' })
  const [contractForm, setContractForm] = useState<{
    areaId: string
    rateTemplateId: string
    useCustomRate: boolean
    ratePerMinute: string
    adjustmentPerMinute: string
    baseSalary: string
    baseSalaryUnit: string
  }>({
    areaId: '',
    rateTemplateId: '',
    useCustomRate: false,
    ratePerMinute: '',
    adjustmentPerMinute: '0',
    baseSalary: '',
    baseSalaryUnit: 'MONTHLY',
  })

  const openContractCreate = (staff: StaffWithContract) => {
    setSelectedStaff(staff)
    setSelectedContract(null)
    setContractForm({
      areaId: '',
      rateTemplateId: '',
      useCustomRate: false,
      ratePerMinute: '',
      adjustmentPerMinute: '0',
      baseSalary: '',
      baseSalaryUnit: 'MONTHLY',
    })
    setContractDialogOpen(true)
  }

  const openContractEdit = (staff: StaffWithContract) => {
    if (!staff.contract) return
    setSelectedStaff(staff)
    setSelectedContract(staff.contract)
    setContractForm({
      areaId: staff.contract.areaId || '',
      rateTemplateId: staff.contract.rateTemplateId || '',
      useCustomRate: staff.contract.source === 'custom',
      ratePerMinute: staff.contract.ratePerMinute != null ? String(staff.contract.ratePerMinute) : '',
      adjustmentPerMinute: String(staff.contract.adjustmentPerMinute ?? 0),
      baseSalary: staff.contract.baseSalary != null ? String(staff.contract.baseSalary) : '',
      baseSalaryUnit: staff.contract.baseSalaryUnit || 'MONTHLY',
    })
    setContractDialogOpen(true)
  }

  const openTemplateCreate = () => {
    setTemplateForm({ id: null, name: '', ratePerMinute: '', baseSalary: '' })
    setTemplateDialogOpen(true)
  }

  const openTemplateEdit = (id: string, name: string, ratePerMinute: number, baseSalary: number | null) => {
    setTemplateForm({
      id,
      name,
      ratePerMinute: String(ratePerMinute),
      baseSalary: baseSalary != null ? String(baseSalary) : '',
    })
    setTemplateDialogOpen(true)
  }

  const handleSaveContract = () => {
    if (!selectedStaff) return
    const isEdit = !!selectedContract

    const ratePerMinute = contractForm.useCustomRate
      ? parseFloat(contractForm.ratePerMinute)
      : undefined
    if (contractForm.useCustomRate && (isNaN(ratePerMinute!) || ratePerMinute! < 0)) {
      toast.error(t('toast.error'))
      return
    }

    const payload = {
      userId: selectedStaff.id,
      areaId: contractForm.areaId || undefined,
      rateTemplateId: contractForm.rateTemplateId || undefined,
      ratePerMinute,
      adjustmentPerMinute: parseFloat(contractForm.adjustmentPerMinute) || 0,
      baseSalary: contractForm.baseSalary ? parseFloat(contractForm.baseSalary) : undefined,
      baseSalaryUnit: contractForm.baseSalary
        ? (contractForm.baseSalaryUnit as 'MONTHLY' | 'DAILY' | 'HOURLY')
        : undefined,
    }

    if (!isEdit && !payload.rateTemplateId && payload.ratePerMinute === undefined) {
      toast.error(t('toast.error'))
      return
    }

    startTransition(async () => {
      const result = isEdit
        ? await updateContractAction(selectedContract!.id, {
            areaId: payload.areaId || null,
            rateTemplateId: payload.rateTemplateId || null,
            ratePerMinute: payload.ratePerMinute ?? null,
            adjustmentPerMinute: payload.adjustmentPerMinute,
            baseSalary: payload.baseSalary ?? null,
            baseSalaryUnit: payload.baseSalaryUnit ?? null,
          })
        : await createContractAction(payload)

      if (result.success) {
        toast.success(isEdit ? t('toast.contractUpdated') : t('toast.contractCreated'))
        setContractDialogOpen(false)
        setSelectedStaff(null)
        router.refresh()
      } else toast.error(result.error || t('toast.error'))
    })
  }

  const handleSaveTemplate = () => {
    if (!templateForm.name.trim()) {
      toast.error(t('toast.error'))
      return
    }
    const ratePerMinute = parseFloat(templateForm.ratePerMinute)
    if (isNaN(ratePerMinute) || ratePerMinute < 0) {
      toast.error(t('toast.error'))
      return
    }

    startTransition(async () => {
      const payload = {
        name: templateForm.name.trim(),
        ratePerMinute,
        baseSalary: templateForm.baseSalary ? parseFloat(templateForm.baseSalary) : undefined,
        baseSalaryUnit: templateForm.baseSalary
          ? ('MONTHLY' as const)
          : undefined,
      }
      const result = templateForm.id
        ? await updateRateTemplateAction(templateForm.id, payload)
        : await createRateTemplateAction(payload)

      if (result.success) {
        toast.success(templateForm.id ? t('toast.templateUpdated') : t('toast.templateCreated'))
        setTemplateDialogOpen(false)
        router.refresh()
      } else toast.error(result.error || t('toast.error'))
    })
  }

  const handleEndContract = () => {
    if (!selectedContract) return
    startTransition(async () => {
      const result = await endContractAction(selectedContract.id)
      if (result.success) {
        toast.success(t('toast.contractEnded'))
        setEndContractDialogOpen(false)
        setSelectedStaff(null)
        setSelectedContract(null)
        router.refresh()
      } else toast.error(result.error || t('toast.error'))
    })
  }

  const handleDeleteTemplate = () => {
    if (!deleteTemplateTarget) return
    startTransition(async () => {
      const result = await deleteRateTemplateAction(deleteTemplateTarget.id)
      if (result.success) {
        toast.success(t('toast.templateDeleted'))
        setDeleteTemplateDialogOpen(false)
        setDeleteTemplateTarget(null)
        router.refresh()
      } else toast.error(result.error || t('toast.error'))
    })
  }

  const getRateSourceLabel = (contract: NonNullable<StaffWithContract['contract']>) => {
    if (contract.source === 'template' && contract.rateTemplateName)
      return t('staffTable.source.template', { name: contract.rateTemplateName })
    if (contract.source === 'template_adjusted' && contract.rateTemplateName)
      return t('staffTable.source.template_adjusted', {
        name: contract.rateTemplateName,
        adjustment: formatCurrency(contract.adjustmentPerMinute),
      })
    return t('staffTable.source.custom')
  }

  return (
    <section className="space-y-8" aria-labelledby="contracts-heading">
      <header>
        <h2 id="contracts-heading" className="text-2xl font-bold">{t('staffTable.title')}</h2>
        <p className="text-muted-foreground mt-1">{t('description')}</p>
      </header>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('rateTemplates.title')}</CardTitle>
              <CardDescription>{t('rateTemplates.description')}</CardDescription>
            </div>
            <Button onClick={openTemplateCreate} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              {t('rateTemplates.create')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {data.rateTemplates.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t('rateTemplates.empty')}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {data.rateTemplates.map((rt) => (
                <Badge key={rt.id} variant="secondary" className="gap-2 py-2">
                  <span>{rt.name}</span>
                  <span className="font-mono">{formatCurrency(rt.ratePerMinute)}{t('perMinute')}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0"
                    onClick={() => openTemplateEdit(rt.id, rt.name, rt.ratePerMinute, rt.baseSalary)}
                    aria-label={tCommon('edit')}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 text-destructive hover:text-destructive"
                    disabled={(rt._count?.contracts ?? 0) > 0}
                    onClick={() => {
                      setDeleteTemplateTarget({
                        id: rt.id,
                        name: rt.name,
                        contractsCount: rt._count?.contracts ?? 0,
                      })
                      setDeleteTemplateDialogOpen(true)
                    }}
                    aria-label={tCommon('delete')}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('staffTable.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          {data.staff.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">{t('empty.noStaff')}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('staffTable.person')}</TableHead>
                  <TableHead>{t('staffTable.area')}</TableHead>
                  <TableHead>{t('staffTable.rateSource')}</TableHead>
                  <TableHead className="text-right">{t('staffTable.effectiveRate')}</TableHead>
                  <TableHead className="text-right">{t('staffTable.baseSalary')}</TableHead>
                  <TableHead>{t('staffTable.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.staff.map((staff) => (
                  <TableRow key={staff.id}>
                    <TableCell className="font-medium">{staff.name}</TableCell>
                    <TableCell>{staff.contract?.areaName ?? '-'}</TableCell>
                    <TableCell>
                      {staff.contract ? (
                        getRateSourceLabel(staff.contract)
                      ) : (
                        <span className="text-muted-foreground">{t('staffTable.noContract')}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {staff.contract
                        ? `${formatCurrency(staff.contract.effectiveRatePerMinute)}${t('perMinute')}`
                        : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {staff.contract?.baseSalary != null
                        ? formatCurrency(staff.contract.baseSalary) +
                          (staff.contract.baseSalaryUnit === 'MONTHLY' ? '/mes' : '')
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {staff.contract ? (
                        <span className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => openContractEdit(staff)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              setSelectedContract(staff.contract!)
                              setSelectedStaff(staff)
                              setEndContractDialogOpen(true)
                            }}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        </span>
                      ) : (
                        <Button size="sm" onClick={() => openContractCreate(staff)}>
                          <Plus className="mr-2 h-4 w-4" />
                          {t('contract.create')}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={contractDialogOpen} onOpenChange={setContractDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {selectedContract
                ? t('contract.editTitle', { name: selectedStaff?.name ?? '' })
                : t('contract.createTitle', { name: selectedStaff?.name ?? '' })}
            </DialogTitle>
            <DialogDescription />
          </DialogHeader>
          <div className="grid gap-5 py-5">
            <div className="grid gap-2">
              <Label>{t('contract.area')}</Label>
              <Select
                value={contractForm.areaId}
                onValueChange={(v) => setContractForm({ ...contractForm, areaId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('contract.areaPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">-</SelectItem>
                  {data.areas.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>{t('contract.rateType')}</Label>
              <Select
                value={contractForm.rateTemplateId}
                onValueChange={(v) =>
                  setContractForm({
                    ...contractForm,
                    rateTemplateId: v,
                    useCustomRate: v === '',
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('contract.rateTypePlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t('contract.useCustom')}</SelectItem>
                  {data.rateTemplates.map((rt) => (
                    <SelectItem key={rt.id} value={rt.id}>
                      {rt.name} ({formatCurrency(rt.ratePerMinute)}{t('perMinute')})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {contractForm.rateTemplateId && (
              <div className="grid gap-2">
                <Label>{t('contract.adjustment')}</Label>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={contractForm.adjustmentPerMinute}
                  onChange={(e) =>
                    setContractForm({ ...contractForm, adjustmentPerMinute: e.target.value })
                  }
                  placeholder="0"
                />
                <p className="text-muted-foreground text-xs">{t('contract.adjustmentHelp')}</p>
              </div>
            )}
            {!contractForm.rateTemplateId && (
              <div className="grid gap-2">
                <Label>{t('contract.customRate')}</Label>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={contractForm.ratePerMinute}
                  onChange={(e) =>
                    setContractForm({ ...contractForm, ratePerMinute: e.target.value })
                  }
                  placeholder="0"
                />
              </div>
            )}
            <div className="grid gap-2">
              <Label>{t('contract.baseSalary')}</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={contractForm.baseSalary}
                  onChange={(e) =>
                    setContractForm({ ...contractForm, baseSalary: e.target.value })
                  }
                  placeholder="0"
                />
                <Select
                  value={contractForm.baseSalaryUnit}
                  onValueChange={(v) =>
                    setContractForm({ ...contractForm, baseSalaryUnit: v })
                  }
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MONTHLY">{t('contract.baseSalaryUnits.MONTHLY')}</SelectItem>
                    <SelectItem value="DAILY">{t('contract.baseSalaryUnits.DAILY')}</SelectItem>
                    <SelectItem value="HOURLY">{t('contract.baseSalaryUnits.HOURLY')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setContractDialogOpen(false)}>
              {tCommon('cancel')}
            </Button>
            <Button onClick={handleSaveContract} disabled={isPending}>
              {isPending ? tCommon('loading') : tCommon('save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {templateForm.id
                ? t('rateTemplateForm.editTitle')
                : t('rateTemplateForm.createTitle')}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-5 py-5">
            <div className="grid gap-2">
              <Label>{t('rateTemplateForm.name')}</Label>
              <Input
                value={templateForm.name}
                onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                placeholder={t('rateTemplateForm.namePlaceholder')}
              />
            </div>
            <div className="grid gap-2">
              <Label>{t('rateTemplateForm.ratePerMinute')}</Label>
              <Input
                type="number"
                min={0}
                step={0.01}
                value={templateForm.ratePerMinute}
                onChange={(e) => setTemplateForm({ ...templateForm, ratePerMinute: e.target.value })}
                placeholder="0"
              />
            </div>
            <div className="grid gap-2">
              <Label>{t('rateTemplateForm.baseSalary')}</Label>
              <Input
                type="number"
                min={0}
                step={0.01}
                value={templateForm.baseSalary}
                onChange={(e) => setTemplateForm({ ...templateForm, baseSalary: e.target.value })}
                placeholder="0"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTemplateDialogOpen(false)}>
              {tCommon('cancel')}
            </Button>
            <Button onClick={handleSaveTemplate} disabled={isPending}>
              {isPending ? tCommon('loading') : tCommon('save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={endContractDialogOpen} onOpenChange={setEndContractDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('delete.contractTitle')}</DialogTitle>
            <DialogDescription>{t('delete.contractDescription')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEndContractDialogOpen(false)}>
              {tCommon('cancel')}
            </Button>
            <Button variant="destructive" onClick={handleEndContract} disabled={isPending}>
              {isPending ? t('delete.deleting') : t('delete.endContract')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteTemplateDialogOpen} onOpenChange={setDeleteTemplateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('delete.templateTitle')}</DialogTitle>
            <DialogDescription>{t('delete.templateDescription')}</DialogDescription>
          </DialogHeader>
          {deleteTemplateTarget && (
            <p className="text-sm">
              {deleteTemplateTarget.name}
              {deleteTemplateTarget.contractsCount > 0 &&
                ` (${t('rateTemplateForm.contractsCount', {
                  count: deleteTemplateTarget.contractsCount,
                })})`}
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTemplateDialogOpen(false)}>
              {tCommon('cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteTemplate}
              disabled={
                isPending || (deleteTemplateTarget?.contractsCount ?? 0) > 0
              }
            >
              {isPending ? t('delete.deleting') : tCommon('delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
