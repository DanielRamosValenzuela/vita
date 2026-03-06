'use client'

import { useTranslations } from 'next-intl'

import { Badge } from '@/src/shared/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/ui/card'

import type { PayrollPeriodSummary } from '@/src/entities/payroll/lib/types'

const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
]

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  GENERATING: 'secondary',
  COMPLETED: 'default',
  COMPLETED_WITH_ERRORS: 'outline',
  FAILED: 'destructive',
}

interface PayrollPeriodsListProps {
  periods: PayrollPeriodSummary[]
  selectedPeriodId: string | null
  onSelectPeriod: (periodId: string) => void
  currency: string
}

function formatCurrency(amount: number, currency: string): string {
  if (currency === 'CLP') return `$${Math.round(amount).toLocaleString('es-CL')}`

  return `$${amount.toFixed(2)}`
}

export function PayrollPeriodsList({
  periods,
  selectedPeriodId,
  onSelectPeriod,
  currency,
}: PayrollPeriodsListProps) {
  const t = useTranslations('payroll')

  if (periods.length === 0)
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">{t('periods.empty')}</p>
        </CardContent>
      </Card>
    )

  return (
    <div className="space-y-2">
      {periods.map((period) => (
        <Card
          key={period.id}
          className={`cursor-pointer transition-colors hover:bg-muted/50 ${
            selectedPeriodId === period.id ? 'border-primary ring-primary ring-1' : ''
          }`}
          onClick={() => onSelectPeriod(period.id)}
        >
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                {MONTH_NAMES[period.month - 1]} {period.year}
              </CardTitle>
              <Badge variant={STATUS_VARIANT[period.status] ?? 'secondary'}>
                {t(`status.${period.status}`)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex gap-4 p-4 pt-0">
            <span className="text-muted-foreground text-sm">
              {t('periods.documents', { count: period.totalDocuments })}
            </span>
            <span className="text-sm font-medium">
              {formatCurrency(period.totalAmount, currency)}
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
