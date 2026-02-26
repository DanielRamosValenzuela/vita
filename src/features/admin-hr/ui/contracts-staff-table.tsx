'use client'

import { useCallback, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Edit, XCircle } from 'lucide-react'

import { useClientPagination } from '@/src/shared/lib/hooks/use-client-pagination'
import { Badge } from '@/src/shared/ui/badge'
import { Button } from '@/src/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/shared/ui/card'
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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/src/shared/ui/tooltip'

import type { ContractsPageData, StaffWithContract } from '../api/contract-actions'

type CreateContractTarget = {
  userId: string
  userName: string
  hasActiveContract: boolean
  primaryAreaId: string | null
  mode: 'create' | 'add' | 'edit'
  contractId?: string
  currentRateTemplateId?: string
}

interface ContractsStaffTableProps {
  staff: ContractsPageData['staff']
  areas: Array<{ id: string; name: string }>
  rateTemplateOptions: Array<{ id: string; name: string }>
  hasRateTemplates: boolean
  isPending: boolean
  onEditContract: (target: CreateContractTarget) => void
  onEndContract: (target: { id: string; userName: string }) => void
  onAddContract: (target: {
    userId: string
    userName: string
    primaryAreaId: string | null
  }) => void
  onCreateContract: (target: CreateContractTarget) => void
  onViewContracts: (target: {
    userId: string
    userName: string
    contracts: StaffWithContract['contracts']
  }) => void
}

export function ContractsStaffTable({
  staff,
  areas,
  rateTemplateOptions,
  hasRateTemplates,
  isPending,
  onEditContract,
  onEndContract,
  onAddContract,
  onCreateContract,
  onViewContracts,
}: ContractsStaffTableProps) {
  const t = useTranslations('adminHR.rates')
  const tFilters = useTranslations('common.filters')
  const [contractFilter, setContractFilter] = useState<string>('all')
  const [areaFilter, setAreaFilter] = useState<string>('all')
  const [templateFilter, setTemplateFilter] = useState<string>('all')

  const filterFn = useCallback(
    (person: ContractsPageData['staff'][number]) => {
      if (contractFilter === 'withContract' && person.contracts.length === 0) return false
      if (contractFilter === 'withoutContract' && person.contracts.length > 0) return false
      if (areaFilter !== 'all') {
        const personAreaId = person.contracts[0]?.areaId ?? person.primaryAreaId
        if (personAreaId !== areaFilter) return false
      }
      if (templateFilter !== 'all') {
        const hasTemplate = person.contracts.some((c) => c.rateTemplateId === templateFilter)
        if (!hasTemplate) return false
      }
      return true
    },
    [contractFilter, areaFilter, templateFilter]
  )

  const { paginatedItems, page, totalPages, total, from, to, search, setSearch, setPage } =
    useClientPagination({
      items: staff,
      pageSize: 10,
      searchFn: (person, query) =>
        person.name.toLowerCase().includes(query) ||
        person.email.toLowerCase().includes(query),
      filterFn,
    })

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('staffTable.title')}</CardTitle>
        <CardDescription>{t('staffTable.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        {staff.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">{t('empty.noStaff')}</div>
        ) : (
          <div className="space-y-4">
            <DataTableToolbar
              search={search}
              onSearchChange={setSearch}
              total={total}
              from={from}
              to={to}
            >
              <Select value={contractFilter} onValueChange={setContractFilter}>
                <SelectTrigger className="min-w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{tFilters('allStatuses')}</SelectItem>
                  <SelectItem value="withContract">{tFilters('withContract')}</SelectItem>
                  <SelectItem value="withoutContract">{tFilters('withoutContract')}</SelectItem>
                </SelectContent>
              </Select>
              {areas.length > 0 && (
                <Select value={areaFilter} onValueChange={setAreaFilter}>
                  <SelectTrigger className="min-w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{tFilters('allAreas')}</SelectItem>
                    {areas.map((area) => (
                      <SelectItem key={area.id} value={area.id}>
                        {area.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {rateTemplateOptions.length > 0 && (
                <Select value={templateFilter} onValueChange={setTemplateFilter}>
                  <SelectTrigger className="min-w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{tFilters('allTemplates')}</SelectItem>
                    {rateTemplateOptions.map((tpl) => (
                      <SelectItem key={tpl.id} value={tpl.id}>
                        {tpl.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </DataTableToolbar>
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
                  {paginatedItems.map((person) => {
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
                        {primaryContract?.areaName || person.primaryAreaName || (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {primaryContract ? (
                          <div className="space-y-1">
                            <div>{primaryContract.rateTemplateName}</div>
                            {primaryContract.customMultiplier && (
                              <div className="text-xs text-muted-foreground">
                                {t('staffTable.multiplierValue', {
                                  value: primaryContract.customMultiplier,
                                })}
                              </div>
                            )}
                            {hasMultipleContracts && (
                              <Button
                                variant="link"
                                size="sm"
                                className="h-auto px-0 text-xs"
                                onClick={() =>
                                  onViewContracts({
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
                                    onClick={() =>
                                      onEditContract({
                                        userId: person.id,
                                        userName: person.name,
                                        hasActiveContract: hasContract,
                                        primaryAreaId:
                                          primaryContract.areaId ?? person.primaryAreaId,
                                        mode: 'edit',
                                        contractId: primaryContract.id,
                                        currentRateTemplateId: primaryContract.rateTemplateId,
                                      })
                                    }
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
                                      onEndContract({
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
                                  if (hasContract)
                                    onAddContract({
                                      userId: person.id,
                                      userName: person.name,
                                      primaryAreaId: person.primaryAreaId,
                                    })
                                  else
                                    onCreateContract({
                                      userId: person.id,
                                      userName: person.name,
                                      hasActiveContract: false,
                                      primaryAreaId: person.primaryAreaId,
                                      mode: 'create',
                                    })
                                }}
                                disabled={isPending || !hasRateTemplates}
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
            <DataTablePagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
