'use client'

import { useReducer, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

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

import {
  createContractAction,
  endContractAction,
  updateContractAction,
  type ContractsPageData,
  type StaffWithContract,
} from '../api/contract-actions'
import { deleteRateTemplateAction, duplicateRateTemplateAction } from '../api/rate-template-actions'
import { RateTemplateForm } from './rate-template-form'
import { ContractsRateTemplatesCard } from './contracts-rate-templates-card'
import { ContractsStaffTable } from './contracts-staff-table'
import { ViewContractsDialog } from './view-contracts-dialog'
import { CreateContractDialog } from './create-contract-dialog'

interface ContractsPageProps {
  data: ContractsPageData
  currency: 'CLP' | 'USD' | 'COP' | 'ARS' | 'MXN' | 'PEN' | 'EUR'
}

type CreateContractTarget = {
  userId: string
  userName: string
  hasActiveContract: boolean
  primaryAreaId: string | null
  mode: 'create' | 'add' | 'edit'
  contractId?: string
  currentRateTemplateId?: string
}

type DialogState = {
  createTemplateOpen: boolean
  editTemplateId: string | null
  deleteTemplateTarget: { id: string; name: string } | null
  endContractTarget: { id: string; userName: string } | null
  createContractTarget: CreateContractTarget | null
  multipleContractWarningTarget: { userId: string; userName: string; primaryAreaId: string | null } | null
  viewContractsTarget: { userId: string; userName: string; contracts: StaffWithContract['contracts'] } | null
}

type DialogAction =
  | { type: 'SET_CREATE_TEMPLATE_OPEN'; payload: boolean }
  | { type: 'SET_EDIT_TEMPLATE_ID'; payload: string | null }
  | { type: 'SET_DELETE_TEMPLATE_TARGET'; payload: { id: string; name: string } | null }
  | { type: 'SET_END_CONTRACT_TARGET'; payload: { id: string; userName: string } | null }
  | { type: 'SET_CREATE_CONTRACT_TARGET'; payload: CreateContractTarget | null }
  | { type: 'SET_MULTIPLE_CONTRACT_WARNING_TARGET'; payload: { userId: string; userName: string; primaryAreaId: string | null } | null }
  | { type: 'SET_VIEW_CONTRACTS_TARGET'; payload: { userId: string; userName: string; contracts: StaffWithContract['contracts'] } | null }

const initialDialogState: DialogState = {
  createTemplateOpen: false,
  editTemplateId: null,
  deleteTemplateTarget: null,
  endContractTarget: null,
  createContractTarget: null,
  multipleContractWarningTarget: null,
  viewContractsTarget: null,
}

function dialogReducer(state: DialogState, action: DialogAction): DialogState {
  if (action.type === 'SET_CREATE_TEMPLATE_OPEN')
    return { ...state, createTemplateOpen: action.payload }
  else if (action.type === 'SET_EDIT_TEMPLATE_ID')
    return { ...state, editTemplateId: action.payload }
  else if (action.type === 'SET_DELETE_TEMPLATE_TARGET')
    return { ...state, deleteTemplateTarget: action.payload }
  else if (action.type === 'SET_END_CONTRACT_TARGET')
    return { ...state, endContractTarget: action.payload }
  else if (action.type === 'SET_CREATE_CONTRACT_TARGET')
    return { ...state, createContractTarget: action.payload }
  else if (action.type === 'SET_MULTIPLE_CONTRACT_WARNING_TARGET')
    return { ...state, multipleContractWarningTarget: action.payload }
  return { ...state, viewContractsTarget: action.payload }
}

export function ContractsPage({ data, currency }: ContractsPageProps) {
  const t = useTranslations('adminHR.rates')
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [dialogs, dispatch] = useReducer(dialogReducer, initialDialogState)

  const {
    createTemplateOpen,
    editTemplateId,
    deleteTemplateTarget,
    endContractTarget,
    createContractTarget,
    multipleContractWarningTarget,
    viewContractsTarget,
  } = dialogs

  const editingTemplate = data.rateTemplates.find((tpl) => tpl.id === editTemplateId)

  async function handleDeleteTemplate() {
    if (!deleteTemplateTarget) return

    startTransition(async () => {
      const result = await deleteRateTemplateAction(deleteTemplateTarget.id)
      if (result.success) {
        toast.success(result.message)
        dispatch({ type: 'SET_DELETE_TEMPLATE_TARGET', payload: null })
        router.refresh()
      } else toast.error(result.error)
    })
  }

  async function handleDuplicateTemplate(id: string, name: string) {
    startTransition(async () => {
      const newName = `${name} (copia)`
      const result = await duplicateRateTemplateAction(id, newName)
      if (result.success) {
        toast.success(result.message)
        router.refresh()
      } else toast.error(result.error)
    })
  }

  async function handleEndContract() {
    if (!endContractTarget) return

    startTransition(async () => {
      const result = await endContractAction(endContractTarget.id)
      if (result.success) {
        toast.success(result.message)
        dispatch({ type: 'SET_END_CONTRACT_TARGET', payload: null })
        router.refresh()
      } else toast.error(result.error)
    })
  }

  async function handleConfirmContract(selectedRateTemplateId: string) {
    if (!createContractTarget || !selectedRateTemplateId) return

    startTransition(async () => {
      const result =
        createContractTarget.mode === 'edit' && createContractTarget.contractId
          ? await updateContractAction(createContractTarget.contractId, {
              rateTemplateId: selectedRateTemplateId,
            })
          : await createContractAction({
              userId: createContractTarget.userId,
              rateTemplateId: selectedRateTemplateId,
              areaId: createContractTarget.primaryAreaId || undefined,
            })

      if (result.success) {
        if (createContractTarget.mode === 'add') toast.warning(t('contract.multipleWarning'))

        toast.success(
          result.message ||
            t(createContractTarget.mode === 'edit' ? 'contract.edit' : 'contract.create')
        )
        dispatch({ type: 'SET_CREATE_CONTRACT_TARGET', payload: null })
        router.refresh()
      } else toast.error(result.error || t('loadError'))
    })
  }

  function handleEditContractFromView(
    contractId: string,
    contract: StaffWithContract['contracts'][number],
    userId: string,
    userName: string
  ) {
    dispatch({
      type: 'SET_CREATE_CONTRACT_TARGET',
      payload: {
        userId,
        userName,
        hasActiveContract: true,
        primaryAreaId: contract.areaId,
        mode: 'edit',
        contractId,
        currentRateTemplateId: contract.rateTemplateId,
      },
    })
    dispatch({ type: 'SET_VIEW_CONTRACTS_TARGET', payload: null })
  }

  function handleEndContractFromView(contractId: string, userName: string) {
    dispatch({ type: 'SET_END_CONTRACT_TARGET', payload: { id: contractId, userName } })
    dispatch({ type: 'SET_VIEW_CONTRACTS_TARGET', payload: null })
  }

  return (
    <div className="space-y-8">
      <ContractsRateTemplatesCard
        rateTemplates={data.rateTemplates}
        isPending={isPending}
        onCreateTemplate={() => dispatch({ type: 'SET_CREATE_TEMPLATE_OPEN', payload: true })}
        onEditTemplate={(id) => dispatch({ type: 'SET_EDIT_TEMPLATE_ID', payload: id })}
        onDeleteTemplate={(target) => dispatch({ type: 'SET_DELETE_TEMPLATE_TARGET', payload: target })}
        onDuplicateTemplate={handleDuplicateTemplate}
      />

      <ContractsStaffTable
        staff={data.staff}
        hasRateTemplates={data.rateTemplates.length > 0}
        isPending={isPending}
        onEditContract={(target) => dispatch({ type: 'SET_CREATE_CONTRACT_TARGET', payload: target })}
        onEndContract={(target) => dispatch({ type: 'SET_END_CONTRACT_TARGET', payload: target })}
        onAddContract={(target) => dispatch({ type: 'SET_MULTIPLE_CONTRACT_WARNING_TARGET', payload: target })}
        onCreateContract={(target) => dispatch({ type: 'SET_CREATE_CONTRACT_TARGET', payload: target })}
        onViewContracts={(target) => dispatch({ type: 'SET_VIEW_CONTRACTS_TARGET', payload: target })}
      />

      <RateTemplateForm
        open={createTemplateOpen}
        onOpenChange={(open) => dispatch({ type: 'SET_CREATE_TEMPLATE_OPEN', payload: open })}
        currency={currency}
        mode="create"
      />

      {editTemplateId && editingTemplate && (
        <RateTemplateForm
          open={!!editTemplateId}
          onOpenChange={(open) => !open && dispatch({ type: 'SET_EDIT_TEMPLATE_ID', payload: null })}
          currency={currency}
          existingTemplate={editingTemplate as never}
          mode="edit"
        />
      )}

      <AlertDialog
        open={!!deleteTemplateTarget}
        onOpenChange={(open) => !open && dispatch({ type: 'SET_DELETE_TEMPLATE_TARGET', payload: null })}
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
        onOpenChange={(open) => !open && dispatch({ type: 'SET_END_CONTRACT_TARGET', payload: null })}
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

      <AlertDialog
        open={!!multipleContractWarningTarget}
        onOpenChange={(open) => { if (!open) dispatch({ type: 'SET_MULTIPLE_CONTRACT_WARNING_TARGET', payload: null }) }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('contract.multipleWarningTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('contract.multipleWarning')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>{t('delete.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              disabled={isPending}
              onClick={(event) => {
                event.preventDefault()
                if (!multipleContractWarningTarget) return

                dispatch({
                  type: 'SET_CREATE_CONTRACT_TARGET',
                  payload: {
                    userId: multipleContractWarningTarget.userId,
                    userName: multipleContractWarningTarget.userName,
                    hasActiveContract: true,
                    primaryAreaId: multipleContractWarningTarget.primaryAreaId,
                    mode: 'add',
                  },
                })
                dispatch({ type: 'SET_MULTIPLE_CONTRACT_WARNING_TARGET', payload: null })
              }}
            >
              {t('contract.multipleWarningConfirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ViewContractsDialog
        target={viewContractsTarget}
        isPending={isPending}
        onClose={() => dispatch({ type: 'SET_VIEW_CONTRACTS_TARGET', payload: null })}
        onEditContract={handleEditContractFromView}
        onEndContract={handleEndContractFromView}
      />

      <CreateContractDialog
        key={createContractTarget?.contractId ?? createContractTarget?.userId ?? 'new'}
        target={createContractTarget}
        rateTemplates={data.rateTemplates}
        isPending={isPending}
        onClose={() => dispatch({ type: 'SET_CREATE_CONTRACT_TARGET', payload: null })}
        onConfirm={handleConfirmContract}
      />
    </div>
  )
}
