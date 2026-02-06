'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { Edit, Plus, Trash2, Copy } from 'lucide-react'
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

import type { ContractsPageData } from '../api/contract-actions'
import {
  deleteRateTemplateAction,
  duplicateRateTemplateAction,
} from '../api/rate-template-actions'
import { RateTemplateForm } from './rate-template-form'
import { endContractAction } from '../api/contract-actions'

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

  const editingTemplate = data.rateTemplates.find((t) => t.id === editTemplateId)

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
                  {data.staff.map((person) => (
                    <TableRow key={person.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{person.name}</div>
                          <div className="text-sm text-muted-foreground">{person.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {person.contract?.areaName || (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {person.contract ? (
                          <div>
                            <div>{person.contract.rateTemplateName}</div>
                            {person.contract.customMultiplier && (
                              <div className="text-xs text-muted-foreground">
                                {t('staffTable.multiplierValue', { value: person.contract.customMultiplier })}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">{t('empty.noContract')}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {person.contract ? (
                          <Badge variant="default">{t('staffTable.statusActive')}</Badge>
                        ) : (
                          <Badge variant="secondary">{t('staffTable.statusNoContract')}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {person.contract && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() =>
                              setEndContractTarget({
                                id: person.contract!.id,
                                userName: person.name,
                              })
                            }
                          >
                            {t('staffTable.endContract')}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
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
    </div>
  )
}
