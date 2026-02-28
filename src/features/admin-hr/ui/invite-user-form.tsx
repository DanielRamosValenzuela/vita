'use client'

import { useReducer, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import type { Role } from '@prisma/client'
import { toast } from 'sonner'

import { ROLES } from '@/src/shared/lib/constants'
import { InviteUserFormBase, type FoundUser } from '@/src/shared/ui/molecules'

import { inviteChiefAction, inviteStaffAction, searchUserAction } from '../api/invitation-actions'

interface InviteUserFormProps {
  organizationId: string
  organizationCountry: import('@prisma/client').Country
  translationNamespace: string
  allowedRoles: Array<{ value: Role; label: string }>
  defaultRole: Role
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

export function InviteUserForm({
  organizationId,
  organizationCountry,
  translationNamespace,
  allowedRoles,
  defaultRole,
  onSuccess,
}: InviteUserFormProps) {
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

  const handleInvite = async (selectedRole?: Role) => {
    if (!state.foundUser) return
    const role = selectedRole || defaultRole
    if (!role) {
      dispatch({ type: 'SET_ERROR', payload: t('roleRequired') || 'Debes seleccionar un rol' })
      return
    }

    startTransition(async () => {
      let result
      if (role === ROLES.CHIEF_AREA || role === ROLES.CHIEF_SECTOR)
        result = await inviteChiefAction(organizationId, state.foundUser!.id)
      else if (role === ROLES.STAFF)
        result = await inviteStaffAction(organizationId, state.foundUser!.id)
      else {
        dispatch({ type: 'SET_ERROR', payload: 'Rol no válido' })
        return
      }

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
      allowedRoles={allowedRoles}
      defaultRole={defaultRole}
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
