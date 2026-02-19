'use client'

import { useTranslations } from 'next-intl'
import { Edit, XCircle } from 'lucide-react'

import { Badge } from '@/src/shared/ui/badge'
import { Button } from '@/src/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/src/shared/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/shared/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/src/shared/ui/tooltip'

import type { StaffWithContract } from '../api/contract-actions'

type ContractSummary = StaffWithContract['contracts'][number]

type ViewContractsTarget = {
  userId: string
  userName: string
  contracts: ContractSummary[]
}

interface ViewContractsDialogProps {
  target: ViewContractsTarget | null
  isPending: boolean
  onClose: () => void
  onEditContract: (contractId: string, contract: ContractSummary, userId: string, userName: string) => void
  onEndContract: (contractId: string, userName: string) => void
}

export function ViewContractsDialog({
  target,
  isPending,
  onClose,
  onEditContract,
  onEndContract,
}: ViewContractsDialogProps) {
  const t = useTranslations('adminHR.rates')

  return (
    <Dialog open={!!target} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {target ? t('contract.viewAllTitle', { name: target.userName }) : ''}
          </DialogTitle>
          <DialogDescription>{t('contract.viewAllDescription')}</DialogDescription>
        </DialogHeader>

        {target && (
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
                {target.contracts.map((contract) => (
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
                              onClick={() =>
                                onEditContract(
                                  contract.id,
                                  contract,
                                  target.userId,
                                  target.userName
                                )
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
                              onClick={() => onEndContract(contract.id, target.userName)}
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
  )
}
