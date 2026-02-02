'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import type { Country } from '@prisma/client'
import { CheckCircle2, Pencil } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { formatTaxId, getTaxIdConfig } from '@/src/shared/lib/utils/tax-id-config'
import { Button } from '@/src/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/shared/ui/card'

import { DocumentForm } from './document-form'

interface DocumentSectionProps {
  user: {
    country: Country | null
    docNumber: string | null
  } | null
}

export function DocumentSection({ user }: DocumentSectionProps) {
  const t = useTranslations('profile.document')
  const tOrgs = useTranslations('superAdmin.organizations')
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)

  const hasDocument = Boolean(user?.docNumber && user?.country)

  if (!hasDocument || showForm)
    return (
      <DocumentForm
        initialData={{
          country: user?.country ?? null,
          docNumber: user?.docNumber ?? null,
        }}
        onCancel={hasDocument ? () => setShowForm(false) : undefined}
        onSuccess={() => {
          setShowForm(false)
          router.refresh()
        }}
      />
    )

  const docUser = user!
  return (
    <Card>
      <CardHeader className="gap-1">
        <CardTitle className="flex items-center gap-2 text-lg">
          <span
            className="bg-primary/10 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
            aria-hidden
          >
            <CheckCircle2 className="h-4 w-4" />
          </span>
          {t('registeredTitle')}
        </CardTitle>
        <CardDescription className="mt-1">
          {t('registeredDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <dl
          className="bg-muted/50 border-border rounded-lg border p-4 grid gap-3 sm:grid-cols-2"
          aria-label={t('registeredTitle')}
        >
          <div className="space-y-1">
            <dt className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
              {t('country.label')}
            </dt>
            <dd className="font-medium">
              {tOrgs(`countries.${docUser.country}`)}
            </dd>
          </div>
          <div className="space-y-1">
            <dt className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
              {getTaxIdConfig(docUser.country!).label}
            </dt>
            <dd className="font-mono font-medium tabular-nums">
              {formatTaxId(docUser.docNumber!, docUser.country!)}
            </dd>
          </div>
        </dl>
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowForm(true)}
            className="gap-2"
            aria-label={t('changeButton')}
          >
            <Pencil className="h-4 w-4" aria-hidden />
            {t('changeButton')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
