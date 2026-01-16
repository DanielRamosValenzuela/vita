'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import type { Role } from '@prisma/client'
import { toast } from 'sonner'

import {
  InviteUserFormBase,
  type FoundUser,
} from '@/src/shared/ui/molecules'
import { ROLES } from '@/src/shared/lib/constants'

import {
  inviteChiefAction,
  inviteStaffAction,
  searchUserAction,
} from '../api/invitation-actions'

export interface InviteUserFormProps {
  organizationId: string
  organizationCountry: import('@prisma/client').Country
  translationNamespace: string
  allowedRoles: Array<{ value: Role; label: string }>
  defaultRole: Role
  onSuccess?: () => void
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
  const [isSearching, setIsSearching] = useState(false)
  const [emailValue, setEmailValue] = useState('')
  const [docValue, setDocValue] = useState('')
  const [foundUser, setFoundUser] = useState<FoundUser | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleEmailChange = (value: string) => {
    setEmailValue(value)
    setDocValue('')
    setFoundUser(null)
    setError(null)
  }

  const handleDocChange = (value: string) => {
    setDocValue(value)
    setEmailValue('')
    setFoundUser(null)
    setError(null)
  }

  const handleSearch = () => {
    const searchTerm = emailValue.trim() || docValue.trim()

    if (!searchTerm) {
      setError(t('searchRequired'))
      return
    }

    setIsSearching(true)
    setError(null)
    setFoundUser(null)

    startTransition(async () => {
      const result = await searchUserAction(searchTerm, organizationCountry)

      setIsSearching(false)

      if (result.success && result.data) 
        setFoundUser(result.data as FoundUser)
       else {
        setError(result.error || t('searchError'))
        setFoundUser(null)
      }
    })
  }

  const handleInvite = (selectedRole?: Role) => {
    if (!foundUser) return
    const role = selectedRole || defaultRole
    if (!role) {
      setError(t('roleRequired') || 'Debes seleccionar un rol')
      return
    }

    startTransition(async () => {
      let result
      if (role === ROLES.CHIEF_AREA) 
        result = await inviteChiefAction(organizationId, foundUser.id)
       else if (role === ROLES.STAFF_HEALTH) 
        result = await inviteStaffAction(organizationId, foundUser.id)
       else {
        setError('Rol no válido')
        return
      }

      if (result.success) {
        toast.success(result.message || t('inviteSuccess'))
        setEmailValue('')
        setDocValue('')
        setFoundUser(null)
        setError(null)
        router.refresh()
        if (onSuccess) 
          onSuccess()
        
      } else {
        const errorMessage = result.error || t('inviteError')
        toast.error(errorMessage)
        setError(errorMessage)
      }
    })
  }

  const handleCancel = () => {
    setFoundUser(null)
    setEmailValue('')
    setDocValue('')
    setError(null)
  }

  return (
    <InviteUserFormBase
      organizationCountry={organizationCountry}
      translationNamespace={translationNamespace}
      allowedRoles={allowedRoles}
      defaultRole={defaultRole}
      isSearching={isSearching}
      isPending={isPending}
      foundUser={foundUser}
      error={error}
      onEmailChange={handleEmailChange}
      onDocChange={handleDocChange}
      onSearch={handleSearch}
      onInvite={handleInvite}
      onCancel={handleCancel}
    />
  )
}
