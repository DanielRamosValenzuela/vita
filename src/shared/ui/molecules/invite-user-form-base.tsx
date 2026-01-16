'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import type { Role } from '@prisma/client'
import { AlertCircle, CheckCircle2, Loader2, Mail, Search, User } from 'lucide-react'

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

import { validateEmail } from '@/src/shared/lib/validation'

export interface FoundUser {
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

export interface InviteUserFormBaseProps {
  organizationCountry: import('@prisma/client').Country
  translationNamespace: string
  allowedRoles?: Array<{ value: Role; label: string }>
  defaultRole?: Role
  isSearching?: boolean
  isPending?: boolean
  foundUser: FoundUser | null
  error: string | null
  onEmailChange: (value: string) => void
  onDocChange: (value: string) => void
  onSearch: () => void
  onInvite: (selectedRole?: Role) => void
  onCancel: () => void
}

export function InviteUserFormBase({
  organizationCountry,
  translationNamespace,
  allowedRoles,
  defaultRole,
  isSearching = false,
  isPending = false,
  foundUser,
  error,
  onEmailChange,
  onDocChange,
  onSearch,
  onInvite,
  onCancel,
}: InviteUserFormBaseProps) {
  const t = useTranslations(translationNamespace)
  const [selectedRole, setSelectedRole] = useState<Role | undefined>(defaultRole)
  const [emailValue, setEmailValue] = useState('')
  const [docValue, setDocValue] = useState('')

  const taxIdConfig = getTaxIdConfig(organizationCountry)
  const isValidEmail = emailValue.trim() ? validateEmail(emailValue) : false
  const isValidDoc = docValue.trim() ? validateTaxId(docValue, organizationCountry) : false
  const canSearch = isValidEmail || isValidDoc

  const handleEmailChange = (value: string) => {
    setEmailValue(value)
    onEmailChange(value)
  }

  const handleDocChange = (value: string) => {
    const formatted = formatTaxId(value, organizationCountry)
    setDocValue(formatted)
    onDocChange(formatted)
  }

  const handleRoleChange = (value: string) => {
    setSelectedRole(value as Role)
    onEmailChange('')
    onDocChange('')
  }

  const hasDocNumber = foundUser?.docNumber !== null && foundUser?.docNumber !== undefined
  const isAlreadyInRole =
    foundUser?.role === selectedRole && foundUser?.organizationId !== undefined && foundUser?.organizationId !== null

  return (
    <section className="space-y-4">
      <fieldset className="space-y-4" disabled={isPending || isSearching}>
        {allowedRoles && allowedRoles.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="role">{t('roleLabel')}</Label>
            <Select
              value={selectedRole}
              onValueChange={handleRoleChange}
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
                  onSearch()
                }
              }}
              disabled={isSearching || isPending || !!docValue}
              className={
                emailValue ? (isValidEmail ? 'pl-10' : 'border-destructive pl-10') : 'pl-10'
              }
            />
          </div>
          {emailValue && !isValidEmail && (
            <p className="text-destructive text-xs" role="alert">
              {t('emailInvalid')}
            </p>
          )}
        </div>

        <div className="relative" role="separator" aria-label={t('or')}>
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
                onSearch()
              }
            }}
            disabled={isSearching || isPending || !!emailValue}
            className={docValue ? (isValidDoc ? '' : 'border-destructive') : ''}
            maxLength={taxIdConfig.maxLength}
          />
          <p className="text-muted-foreground text-xs">{taxIdConfig.description}</p>
          {docValue && !isValidDoc && (
            <p className="text-destructive text-xs" role="alert">
              {t('docInvalid')}
            </p>
          )}
        </div>

        <Button
          onClick={onSearch}
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
      </fieldset>

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
            <dl className="grid gap-2">
              <div className="flex justify-between">
                <dt className="text-muted-foreground text-sm">{t('name')}:</dt>
                <dd className="font-medium">{foundUser.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground text-sm">{t('email')}:</dt>
                <dd>{foundUser.email}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground text-sm">{t('currentRole')}:</dt>
                <dd>
                  <Badge variant="outline">{foundUser.role}</Badge>
                </dd>
              </div>
              {foundUser.docNumber ? (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground text-sm">{t('docNumber')}:</dt>
                  <dd>{foundUser.docNumber}</dd>
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{t('noDocNumberWarning')}</AlertDescription>
                </Alert>
              )}
              {foundUser.organizationId && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {t('inOtherOrg', { orgName: foundUser.organization?.name || '' })}
                  </AlertDescription>
                </Alert>
              )}
            </dl>

            {!hasDocNumber && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>{t('inviteWithoutDoc')}</AlertDescription>
              </Alert>
            )}

            <nav className="flex justify-end gap-2" aria-label={t('actions')}>
              <Button variant="outline" onClick={onCancel} disabled={isPending}>
                {t('cancel')}
              </Button>
              <Button onClick={() => onInvite(selectedRole)} disabled={isPending || isAlreadyInRole}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('inviting')}
                  </>
                ) : (
                  t('sendInvitation')
                )}
              </Button>
            </nav>
          </CardContent>
        </Card>
      )}
    </section>
  )
}
