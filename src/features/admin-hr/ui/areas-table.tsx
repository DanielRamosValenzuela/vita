'use client'

import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/shared/ui/card'
import { Button } from '@/src/shared/ui/button'
import { Badge } from '@/src/shared/ui/badge'
import { Edit, Trash2, Plus } from 'lucide-react'
import Link from 'next/link'
import type { Area } from '@/src/shared/lib/types'

interface AreasTableProps {
  areas: Area[]
}

export function AreasTable({ areas }: AreasTableProps) {
  const t = useTranslations('adminHR.areas')

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t('title')}</CardTitle>
            <CardDescription className="mt-1">{t('description')}</CardDescription>
          </div>
          <Button asChild>
            <Link href="/dashboard/areas/new">
              <Plus className="mr-2 h-4 w-4" />
              {t('new')}
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {areas.length === 0 ? (
          <div className="text-muted-foreground py-8 text-center">
            <p className="mb-4">{t('empty')}</p>
            <Button asChild variant="outline">
              <Link href="/dashboard/areas/new">{t('createFirst')}</Link>
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-muted-foreground pb-3 text-left text-sm font-medium">
                    {t('table.name')}
                  </th>
                  <th className="text-muted-foreground pb-3 text-left text-sm font-medium">
                    {t('table.description')}
                  </th>
                  <th className="text-muted-foreground pb-3 text-left text-sm font-medium">
                    {t('table.status')}
                  </th>
                  <th className="text-muted-foreground pb-3 text-right text-sm font-medium">
                    {t('table.actions')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {areas.map((area) => (
                  <tr key={area.id} className="border-b last:border-0">
                    <td className="py-4 text-sm font-medium">{area.name}</td>
                    <td className="text-muted-foreground py-4 text-sm">
                      {area.description || '-'}
                    </td>
                    <td className="py-4">
                      <Badge variant={area.isActive ? 'default' : 'secondary'}>
                        {area.isActive ? t('status.active') : t('status.inactive')}
                      </Badge>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/dashboard/areas/${area.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" aria-label={t('delete')}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
