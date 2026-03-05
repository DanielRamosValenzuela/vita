'use client'

import { useCallback, useEffect, useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import type { Role } from '@prisma/client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/shared/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/shared/ui/select'
import type { PayrollDocumentSummary, PayrollPeriodSummary } from '@/src/entities/payroll/lib/types'

import {
  getPayrollDocumentsAction,
  getPayrollPeriodsAction,
} from '../api/payroll-history-actions'

import { PayrollDocumentsTable } from './payroll-documents-table'
import { PayrollPeriodsList } from './payroll-periods-list'

interface PayrollPageProps {
  role: Role
  initialPeriods: PayrollPeriodSummary[]
  currency: string
}

export function PayrollPage({ role, initialPeriods, currency }: PayrollPageProps) {
  const t = useTranslations('payroll')
  const currentYear = new Date().getFullYear()
  const [year, setYear] = useState<string>(String(currentYear))
  const [periods, setPeriods] = useState<PayrollPeriodSummary[]>(initialPeriods)
  const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(null)
  const [documents, setDocuments] = useState<PayrollDocumentSummary[]>([])
  const [, startTransition] = useTransition()

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i)
  const isAdmin = role === 'ADMIN_HR'

  const loadPeriods = useCallback(
    (yearValue: string) => {
      startTransition(async () => {
        const result = await getPayrollPeriodsAction({ year: parseInt(yearValue) })
        if (result.success && result.data) 
          setPeriods(result.data)
        
      })
    },
    [startTransition]
  )

  const loadDocuments = useCallback(
    (periodId: string) => {
      startTransition(async () => {
        const result = await getPayrollDocumentsAction({ periodId })
        if (result.success && result.data) 
          setDocuments(result.data)
        
      })
    },
    [startTransition]
  )

  useEffect(() => {
    loadPeriods(year)
  }, [year, loadPeriods])

  const handleSelectPeriod = (periodId: string) => {
    setSelectedPeriodId(periodId)
    loadDocuments(periodId)
  }

  const handleRefresh = () => {
    if (selectedPeriodId) 
      loadDocuments(selectedPeriodId)
    
    loadPeriods(year)
  }

  const selectedPeriod = periods.find((p) => p.id === selectedPeriodId)

  return (
    <div className="space-y-6">
      {}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium">{t('yearFilter')}</label>
        <Select value={year} onValueChange={setYear}>
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        {}
        <div>
          <h3 className="mb-3 text-sm font-medium">{t('periods.title')}</h3>
          <PayrollPeriodsList
            periods={periods}
            selectedPeriodId={selectedPeriodId}
            onSelectPeriod={handleSelectPeriod}
            currency={currency}
          />
        </div>

        {}
        <div>
          {selectedPeriod ? (
            <Card>
              <CardHeader>
                <CardTitle>{t('documents.title')}</CardTitle>
                <CardDescription>
                  {t('periods.documents', { count: selectedPeriod.totalDocuments })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PayrollDocumentsTable
                  documents={documents}
                  periodId={selectedPeriod.id}
                  currency={currency}
                  isAdminHR={isAdmin}
                  onRefresh={handleRefresh}
                />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-muted-foreground py-12 text-center">
                {t('periods.empty')}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
