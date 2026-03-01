'use client'

import { useCallback, useState } from 'react'
import { useTranslations } from 'next-intl'
import { CheckCircle2, ExternalLink, XCircle } from 'lucide-react'

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

import { Link } from '@/i18n/navigation'

import type { StaffWithContract } from '../api/contract-actions'

interface StaffViewPageProps {
  staff: StaffWithContract[]
  canManageRates?: boolean
}

export function StaffViewPage({ staff, canManageRates = false }: StaffViewPageProps) {
  const t = useTranslations('staff')
  const tFilters = useTranslations('common.filters')
  const [contractFilter, setContractFilter] = useState<string>('all')
  const [roleFilter, setRoleFilter] = useState<string>('all')

  const staffWithContract = staff.filter((s) => s.contracts.length > 0)
  const staffWithoutContract = staff.filter((s) => s.contracts.length === 0)

  const filterFn = useCallback(
    (person: StaffWithContract) => {
      if (contractFilter === 'withContract' && person.contracts.length === 0) return false
      if (contractFilter === 'withoutContract' && person.contracts.length > 0) return false
      if (roleFilter === 'CHIEF_AREA' && person.role !== 'CHIEF_AREA') return false
      if (roleFilter === 'CHIEF_SECTOR' && person.role !== 'CHIEF_SECTOR') return false
      if (roleFilter === 'STAFF' && person.role !== 'STAFF') return false
      return true
    },
    [contractFilter, roleFilter]
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('table.title')}</CardTitle>
              <CardDescription>{t('table.description')}</CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                {staff.length} {t('table.totalStaff')}
              </div>
              {canManageRates && (
                <Link href="/dashboard/rates">
                  <Button variant="outline" size="sm">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    {t('goToRates')}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {staff.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">{t('empty')}</div>
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
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="min-w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{tFilters('allRoles')}</SelectItem>
                    <SelectItem value="CHIEF_AREA">{tFilters('chiefArea')}</SelectItem>
                    <SelectItem value="CHIEF_SECTOR">{tFilters('chiefSector')}</SelectItem>
                    <SelectItem value="STAFF">{tFilters('staff')}</SelectItem>
                  </SelectContent>
                </Select>
              </DataTableToolbar>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('table.name')}</TableHead>
                      <TableHead>{t('table.role')}</TableHead>
                      <TableHead>{t('table.area')}</TableHead>
                      <TableHead>{t('table.contract')}</TableHead>
                      <TableHead>{t('table.status')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedItems.map((person) => {
                    const currentContract = person.contracts[0] ?? null
                    const areaName = currentContract?.areaName || person.primaryAreaName

                    return (
                      <TableRow key={person.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{person.name}</div>
                            <div className="text-sm text-muted-foreground">{person.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {person.role === 'CHIEF_AREA'
                              ? t('roles.chiefArea')
                              : person.role === 'CHIEF_SECTOR'
                                ? t('roles.chiefSector')
                                : t('roles.staff')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {areaName ? (
                            <span>{areaName}</span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {currentContract ? (
                            <div className="flex items-center gap-2">
                              <span>{currentContract.rateTemplateName}</span>
                              {currentContract.customMultiplier && (
                                <Badge variant="secondary" className="text-xs">
                                  {t('table.multiplierBadge', {
                                    value: currentContract.customMultiplier,
                                  })}
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">{t('table.noContract')}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {currentContract ? (
                            <div className="flex items-center gap-2 text-green-600">
                              <CheckCircle2 className="h-4 w-4" />
                              <span className="text-sm">{t('table.hasContract')}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <XCircle className="h-4 w-4" />
                              <span className="text-sm">{t('table.noContractStatus')}</span>
                            </div>
                          )}
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

      {canManageRates && staffWithoutContract.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50/50 dark:border-yellow-800 dark:bg-yellow-900/10">
          <CardHeader>
            <CardTitle className="text-yellow-800 dark:text-yellow-200">
              {t('warnings.staffWithoutContract')}
            </CardTitle>
            <CardDescription className="text-yellow-700 dark:text-yellow-300">
              {t('warnings.staffWithoutContractDescription', {
                count: staffWithoutContract.length,
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {staffWithoutContract.map((person) => (
                <li key={person.id} className="flex items-center justify-between">
                  <span className="text-sm">{person.name}</span>
                  <Link href="/dashboard/rates">
                    <Button variant="outline" size="sm">
                      {t('warnings.assignRate')}
                    </Button>
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('stats.withContract')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{staffWithContract.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('stats.withContractDescription')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('stats.withoutContract')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{staffWithoutContract.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('stats.withoutContractDescription')}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
