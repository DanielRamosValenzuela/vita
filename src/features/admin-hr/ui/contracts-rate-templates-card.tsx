'use client'

import { useTranslations } from 'next-intl'
import { Copy, Edit, Plus, Trash2 } from 'lucide-react'

import { useClientPagination } from '@/src/shared/lib/hooks/use-client-pagination'
import { Badge } from '@/src/shared/ui/badge'
import { Button } from '@/src/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/shared/ui/card'
import { DataTablePagination } from '@/src/shared/ui/molecules/data-table-pagination'
import { DataTableToolbar } from '@/src/shared/ui/molecules/data-table-toolbar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/shared/ui/table'

import type { ContractsPageData } from '../api/contract-actions'

interface ContractsRateTemplatesCardProps {
  rateTemplates: ContractsPageData['rateTemplates']
  isPending: boolean
  onCreateTemplate: () => void
  onEditTemplate: (id: string) => void
  onDeleteTemplate: (target: { id: string; name: string }) => void
  onDuplicateTemplate: (id: string, name: string) => void
}

export function ContractsRateTemplatesCard({
  rateTemplates,
  isPending,
  onCreateTemplate,
  onEditTemplate,
  onDeleteTemplate,
  onDuplicateTemplate,
}: ContractsRateTemplatesCardProps) {
  const t = useTranslations('adminHR.rates')

  const { paginatedItems, page, totalPages, total, from, to, search, setSearch, setPage } =
    useClientPagination({
      items: rateTemplates,
      pageSize: 10,
      searchFn: (template, query) => template.name.toLowerCase().includes(query),
    })

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t('rateTemplates.title')}</CardTitle>
            <CardDescription>{t('rateTemplates.description')}</CardDescription>
          </div>
          <Button onClick={onCreateTemplate} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            {t('rateTemplates.create')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {rateTemplates.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="mb-4">{t('rateTemplates.empty')}</p>
            <Button variant="outline" onClick={onCreateTemplate}>
              <Plus className="mr-2 h-4 w-4" />
              {t('rateTemplates.create')}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <DataTableToolbar
              search={search}
              onSearchChange={setSearch}
              total={total}
              from={from}
              to={to}
            />
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
                  {paginatedItems.map((template) => (
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
                          onClick={() => onEditTemplate(template.id)}
                        >
                          <Edit className="mr-1 h-4 w-4" />
                          {t('rateTemplates.table.edit')}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDuplicateTemplate(template.id, template.name)}
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
                              onDeleteTemplate({ id: template.id, name: template.name })
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
            <DataTablePagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
