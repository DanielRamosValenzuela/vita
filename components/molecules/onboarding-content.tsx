'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Building2, Key, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Role } from '@prisma/client'
import type { CurrentUser } from '@/lib/auth/types'
import { useRouter } from '@/i18n/navigation'

interface OnboardingContentProps {
  user: CurrentUser
  locale: string
}

export function OnboardingContent({ user, locale }: OnboardingContentProps) {
  const t = useTranslations('onboarding')
  const router = useRouter()
  const [linkingCode, setLinkingCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isSuperAdmin = user.role === Role.SUPER_ADMIN

  const handleCreateOrganization = () => {
    router.push('/admin/organizations')
  }

  const handleLinkWithCode = async () => {
    if (!linkingCode.trim()) {
      setError(t('otherRoles.options.code.error'))
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      alert('Funcionalidad de vinculación con código pendiente de implementar')
    } catch (err) {
      setError(err instanceof Error ? err.message : t('otherRoles.options.code.error'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = () => {
    router.push('/')
  }

  if (isSuperAdmin) {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">{t('superAdmin.title')}</CardTitle>
          <CardDescription className="text-base">
            {t('superAdmin.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleCreateOrganization} className="w-full" size="lg">
            {t('superAdmin.createButton')}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{t('title')}</CardTitle>
        <CardDescription className="text-base">{t('subtitle')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-4">
            <div className="mb-3 flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold">{t('otherRoles.options.wait.title')}</h3>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">
              {t('otherRoles.options.wait.description')}
            </p>
            <Button variant="outline" className="w-full" onClick={handleSkip}>
              {t('otherRoles.options.wait.button')}
            </Button>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <div className="mb-3 flex items-center gap-3">
              <Key className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold">{t('otherRoles.options.code.title')}</h3>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">
              {t('otherRoles.options.code.description')}
            </p>
            <div className="space-y-2">
              <Label htmlFor="linking-code">{t('otherRoles.options.code.placeholder')}</Label>
              <Input
                id="linking-code"
                value={linkingCode}
                onChange={(e) => {
                  setLinkingCode(e.target.value)
                  setError(null)
                }}
                placeholder={t('otherRoles.options.code.placeholder')}
                disabled={isLoading}
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button
                onClick={handleLinkWithCode}
                disabled={isLoading || !linkingCode.trim()}
                className="w-full"
              >
                {isLoading ? t('common.loading') : t('otherRoles.options.code.button')}
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <Button variant="ghost" className="w-full" onClick={handleSkip}>
            {t('skip')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

