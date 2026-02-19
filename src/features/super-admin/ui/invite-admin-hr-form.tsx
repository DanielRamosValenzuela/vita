'use client'

import { useState, useTransition } from 'react'
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

export function InviteAdminHRForm({
  organizationId,
  organizationCountry,
  translationNamespace,
  onSuccess,
}: InviteAdminHRFormProps) {
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

      if (result.success && result.data) setFoundUser(result.data as FoundUser)
      else {
        setError(result.error || t('searchError'))
        setFoundUser(null)
      }
    })
  }

  const handleInvite = () => {
    if (!foundUser) return

    startTransition(async () => {
      const result = await inviteAdminHRAction(organizationId, foundUser.id)

      if (result.success) {
        toast.success(result.message || t('inviteSuccess'))
        setEmailValue('')
        setDocValue('')
        setFoundUser(null)
        setError(null)
        router.refresh()
        if (onSuccess) onSuccess()
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
