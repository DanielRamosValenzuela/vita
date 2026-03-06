'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

import { cn } from '@/src/shared/lib/utils/cn'
import { Button } from '@/src/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/src/shared/ui/dialog'
import { Input } from '@/src/shared/ui/input'

import type { ContractsPageData } from '../api/contract-actions'

type CreateContractTarget = {
  userId: string
  userName: string
  hasActiveContract: boolean
  primaryAreaId: string | null
  mode: 'create' | 'add' | 'edit'
  contractId?: string
  currentRateTemplateId?: string
}

interface CreateContractDialogProps {
  target: CreateContractTarget | null
  rateTemplates: ContractsPageData['rateTemplates']
  isPending: boolean
  onClose: () => void
  onConfirm: (selectedRateTemplateId: string) => void
}

export function CreateContractDialog({
  target,
  rateTemplates,
  isPending,
  onClose,
  onConfirm,
}: CreateContractDialogProps) {
  const t = useTranslations('adminHR.rates')
  const [rateFilter, setRateFilter] = useState('')
  const [selectedRateTemplateId, setSelectedRateTemplateId] = useState(
    target?.currentRateTemplateId ?? ''
  )

  const filteredRateTemplates =
    rateFilter.trim().length === 0
      ? rateTemplates
      : rateTemplates.filter((template) =>
          template.name.toLowerCase().includes(rateFilter.toLowerCase())
        )

  function handleOpenChange(open: boolean) {
    if (!open) {
      setRateFilter('')
      setSelectedRateTemplateId('')
      onClose()
    }
  }

  return (
    <Dialog open={!!target} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {target ? t('contract.createTitle', { name: target.userName }) : ''}
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
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isPending}>
            {t('templateForm.cancel')}
          </Button>
          <Button
            onClick={() => onConfirm(selectedRateTemplateId)}
            disabled={isPending || !selectedRateTemplateId}
          >
            {isPending ? t('templateForm.saving') : t('contract.create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
