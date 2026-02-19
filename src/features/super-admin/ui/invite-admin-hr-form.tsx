'use client'

import { useReducer, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { InviteUserFormBase, type FoundUser } from '@/src/shared/ui/molecules'

import { inviteAdminHRAction, searchUserAction } from '../api/admin-hr-invitation-actions'

interface InviteAdminHRFormProps {
  organizationId: string
  organizationCountry: import('@prisma/client').Country
  translationNamespace: string
  onSuccess?: () => void
}

interface InviteFormState {
  isSearching: boolean
  emailValue: string
  docValue: string
  foundUser: FoundUser | null
  error: string | null
}

type InviteFormAction =
  | { type: 'SET_SEARCHING'; payload: boolean }
  | { type: 'SET_EMAIL'; payload: string }
  | { type: 'SET_DOC'; payload: string }
  | { type: 'SET_FOUND_USER'; payload: FoundUser | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET' }
  | { type: 'SEARCH_START' }
  | { type: 'SEARCH_SUCCESS'; payload: FoundUser }
  | { type: 'SEARCH_FAIL'; payload: string }

const initialInviteState: InviteFormState = {
  isSearching: false,
  emailValue: '',
  docValue: '',
  foundUser: null,
  error: null,
}

function inviteFormReducer(state: InviteFormState, action: InviteFormAction): InviteFormState {
  switch (action.type) {
    case 'SET_SEARCHING':
      return { ...state, isSearching: action.payload }
    case 'SET_EMAIL':
      return { ...state, emailValue: action.payload, docValue: '', foundUser: null, error: null }
    case 'SET_DOC':
      return { ...state, docValue: action.payload, emailValue: '', foundUser: null, error: null }
    case 'SET_FOUND_USER':
      return { ...state, foundUser: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    case 'RESET':
      return initialInviteState
    case 'SEARCH_START':
      return { ...state, isSearching: true, error: null, foundUser: null }
    case 'SEARCH_SUCCESS':
      return { ...state, isSearching: false, foundUser: action.payload }
    case 'SEARCH_FAIL':
      return { ...state, isSearching: false, error: action.payload, foundUser: null }
    default:
      return state
  }
}

export function InviteAdminHRForm({
  organizationId,
  organizationCountry,
  translationNamespace,
  onSuccess,
}: InviteAdminHRFormProps) {
  const t = useTranslations(translationNamespace)
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [state, dispatch] = useReducer(inviteFormReducer, initialInviteState)

  const handleEmailChange = (value: string) => {
    dispatch({ type: 'SET_EMAIL', payload: value })
  }

  const handleDocChange = (value: string) => {
    dispatch({ type: 'SET_DOC', payload: value })
  }

  const handleSearch = () => {
    const searchTerm = state.emailValue.trim() || state.docValue.trim()

    if (!searchTerm) {
      dispatch({ type: 'SET_ERROR', payload: t('searchRequired') })
      return
    }

    dispatch({ type: 'SEARCH_START' })

    startTransition(async () => {
      const result = await searchUserAction(searchTerm, organizationCountry)

      if (result.success && result.data)
        dispatch({ type: 'SEARCH_SUCCESS', payload: result.data as FoundUser })
      else dispatch({ type: 'SEARCH_FAIL', payload: result.error || t('searchError') })
    })
  }

  const handleInvite = () => {
    if (!state.foundUser) return

    startTransition(async () => {
      const result = await inviteAdminHRAction(organizationId, state.foundUser!.id)

      if (result.success) {
        toast.success(result.message || t('inviteSuccess'))
        dispatch({ type: 'RESET' })
        router.refresh()
        if (onSuccess) onSuccess()
      } else {
        const errorMessage = result.error || t('inviteError')
        toast.error(errorMessage)
        dispatch({ type: 'SET_ERROR', payload: errorMessage })
      }
    })
  }

  const handleCancel = () => {
    dispatch({ type: 'RESET' })
  }

  return (
    <InviteUserFormBase
      organizationCountry={organizationCountry}
      translationNamespace={translationNamespace}
      isSearching={state.isSearching}
      isPending={isPending}
      foundUser={state.foundUser}
      error={state.error}
      onEmailChange={handleEmailChange}
      onDocChange={handleDocChange}
      onSearch={handleSearch}
      onInvite={handleInvite}
      onCancel={handleCancel}
    />
  )
}
