'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import type { Country, Role } from '@prisma/client'
import { AlertCircle, CheckCircle2, Loader2, Mail, Search, User } from 'lucide-react'
import { toast } from 'sonner'

import { formatTaxId, getTaxIdConfig, validateTaxId } from '@/src/shared/lib/utils/tax-id-config'
import { Alert, AlertDescription } from '@/src/shared/ui/alert'
import { Badge } from '@/src/shared/ui/badge'
import { Button } from '@/src/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/shared/ui/card'
import { Input } from '@/src/shared/ui/input'
import { Label } from '@/src/shared/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/shared/ui/select'

interface FoundUser {
  id: string
  name: string
  email: string
  role: string
  country: string | null
  docType: string | null
  docNumber: string | null
  organizationId: string | null
  organization: {
    id: string
    name: string
  } | null
}

type ActionContext = 'admin-hr' | 'super-admin'

interface InviteUserFormProps {
  organizationId: string
  organizationCountry: Country
  translationNamespace: string
  actionContext: ActionContext
  allowedRoles?: Array<{ value: Role; label: string }>
  defaultRole?: Role
  onSuccess?: () => void
}

const validateEmail = (email: string): boolean => {
  if (!email.trim()) return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}

export function InviteUserForm({
  organizationId,
  organizationCountry,
  translationNamespace,
  actionContext,
  allowedRoles,
  defaultRole,
  onSuccess,
}: InviteUserFormProps) {
  const t = useTranslations(translationNamespace)
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isSearching, setIsSearching] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | undefined>(defaultRole)
  const [emailValue, setEmailValue] = useState('')
  const [docValue, setDocValue] = useState('')
  const [foundUser, setFoundUser] = useState<FoundUser | null>(null)
  const [error, setError] = useState<string | null>(null)


  const taxIdConfig = getTaxIdConfig(organizationCountry)
  const isValidEmail = emailValue.trim() ? validateEmail(emailValue) : false
  const isValidDoc = docValue.trim() ? validateTaxId(docValue, organizationCountry) : false
  const canSearch = isValidEmail || isValidDoc

  const handleEmailChange = (value: string) => {
    setEmailValue(value)
    setDocValue('')
    setFoundUser(null)
    setError(null)
  }

  const handleDocChange = (value: string) => {
    const formatted = formatTaxId(value, organizationCountry)
    setDocValue(formatted)
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
      const actions =
        actionContext === 'admin-hr'
          ? await import('@/src/features/admin-hr/api/invitation-actions')
          : await import('@/src/features/super-admin/api/admin-hr-invitation-actions')
      const result = await actions.searchUserAction(searchTerm, organizationCountry)

      setIsSearching(false)

      if (result.success && result.data) {
        setFoundUser(result.data as FoundUser)
      } else {
        setError(result.error || t('searchError'))
        setFoundUser(null)
      }
    })
  }

  const handleInvite = () => {
    if (!foundUser) return
    if (allowedRoles && allowedRoles.length > 0 && !selectedRole) {
      setError(t('roleRequired') || 'Debes seleccionar un rol')
      return
    }

    startTransition(async () => {
      let result
      if (actionContext === 'admin-hr') {
        const actions = await import('@/src/features/admin-hr/api/invitation-actions')
        if (selectedRole === 'CHIEF_AREA') {
          result = await actions.inviteChiefAction(organizationId, foundUser.id)
        } else if (selectedRole === 'STAFF_HEALTH') {
          result = await actions.inviteStaffAction(organizationId, foundUser.id)
        } else {
          throw new Error('Rol no válido')
        }
      } else {
        const actions = await import('@/src/features/super-admin/api/admin-hr-invitation-actions')
        result = await actions.inviteAdminHRAction(organizationId, foundUser.id)
      }

      if (result.success) {
        toast.success(t('inviteSuccess'))
        setEmailValue('')
        setDocValue('')
        setFoundUser(null)
        setError(null)
        router.refresh()
        if (onSuccess) {
          onSuccess()
        }
      } else {
        toast.error(result.error || t('inviteError'))
        setError(result.error || t('inviteError'))
      }
    })
  }

  const hasDocNumber = foundUser?.docNumber !== null && foundUser?.docNumber !== undefined
  const isAlreadyInRole =
    foundUser?.role === selectedRole && foundUser?.organizationId === organizationId
  const isInOtherOrg = foundUser?.organizationId && foundUser.organizationId !== organizationId

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {allowedRoles && allowedRoles.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="role">{t('roleLabel')}</Label>
            <Select
              value={selectedRole}
              onValueChange={(value) => {
                setSelectedRole(value as Role)
                setFoundUser(null)
                setError(null)
              }}
              disabled={isPending || isSearching}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {allowedRoles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">{t('emailLabel')}</Label>
          <div className="relative">
            <Mail className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              id="email"
              type="email"
              placeholder={t('emailPlaceholder')}
              value={emailValue}
              onChange={(e) => handleEmailChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && canSearch && !isSearching) {
                  handleSearch()
                }
              }}
              disabled={isSearching || isPending || !!docValue}
              className={
                emailValue ? (isValidEmail ? 'pl-10' : 'border-destructive pl-10') : 'pl-10'
              }
            />
          </div>
          {emailValue && !isValidEmail && (
            <p className="text-destructive text-xs">{t('emailInvalid')}</p>
          )}
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background text-muted-foreground px-2">{t('or')}</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="docNumber">{taxIdConfig.label}</Label>
          <Input
            id="docNumber"
            placeholder={taxIdConfig.placeholder}
            value={docValue}
            onChange={(e) => handleDocChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && canSearch && !isSearching) {
                handleSearch()
              }
            }}
            disabled={isSearching || isPending || !!emailValue}
            className={docValue ? (isValidDoc ? '' : 'border-destructive') : ''}
            maxLength={taxIdConfig.maxLength}
          />
          <p className="text-muted-foreground text-xs">{taxIdConfig.description}</p>
          {docValue && !isValidDoc && <p className="text-destructive text-xs">{t('docInvalid')}</p>}
        </div>

        <Button
          onClick={handleSearch}
          disabled={!canSearch || isSearching || isPending}
          type="button"
          className="w-full"
        >
          {isSearching ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('searching')}
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              {t('searchButton')}
            </>
          )}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {foundUser && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {t('userFound')}
            </CardTitle>
            <CardDescription>{t('userFoundDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">{t('name')}:</span>
                <span className="font-medium">{foundUser.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">{t('email')}:</span>
                <span>{foundUser.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">{t('currentRole')}:</span>
                <Badge variant="outline">{foundUser.role}</Badge>
              </div>
              {foundUser.docNumber ? (
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">{t('docNumber')}:</span>
                  <span>{foundUser.docNumber}</span>
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{t('noDocNumberWarning')}</AlertDescription>
                </Alert>
              )}
              {isInOtherOrg && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {t('inOtherOrg', { orgName: foundUser.organization?.name || '' })}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {!hasDocNumber && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>{t('inviteWithoutDoc')}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setFoundUser(null)
                  setEmailValue('')
                  setDocValue('')
                  setError(null)
                }}
                disabled={isPending}
              >
                {t('cancel')}
              </Button>
              <Button onClick={handleInvite} disabled={isPending || isAlreadyInRole}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('inviting')}
                  </>
                ) : (
                  t('sendInvitation')
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
