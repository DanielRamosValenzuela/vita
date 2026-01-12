'use client'

import { useState, useTransition, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, AlertTriangle } from 'lucide-react'
import { Button } from '@/src/shared/ui/button'
import { Input } from '@/src/shared/ui/input'
import { Label } from '@/src/shared/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/shared/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/shared/ui/card'
import { Alert, AlertDescription } from '@/src/shared/ui/alert'
import { updateDocumentAction } from '../api/profile-actions'
import { updateDocumentSchema, type UpdateDocumentInput } from '../lib/schemas'
import { getTaxIdConfig, formatTaxId } from '@/src/shared/lib/utils/tax-id-config'
import type { Country } from '@prisma/client'
import { toast } from 'sonner'

interface DocumentFormProps {
  initialData?: {
    country: Country | null
    docNumber: string | null
  }
}

export function DocumentForm({ initialData }: DocumentFormProps) {
  const t = useTranslations('profile.document')
  const tOrgs = useTranslations('superAdmin.organizations')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [docValue, setDocValue] = useState(initialData?.docNumber || '')
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(
    initialData?.country || null
  )

  const form = useForm<UpdateDocumentInput>({
    resolver: selectedCountry ? zodResolver(updateDocumentSchema(selectedCountry)) : undefined,
    defaultValues: {
      country: selectedCountry || undefined,
      docNumber: initialData?.docNumber || '',
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = form

  const taxIdConfig = selectedCountry ? getTaxIdConfig(selectedCountry) : null

  const handleDocChange = (value: string) => {
    if (!selectedCountry) return
    const formatted = formatTaxId(value, selectedCountry)
    setDocValue(formatted)
    setValue('docNumber', formatted, { shouldValidate: true })
  }

  const handleCountryChange = (value: string) => {
    const newCountry = value as Country
    setSelectedCountry(newCountry)
    setValue('country', newCountry, { shouldValidate: true })
    setDocValue('')
    setValue('docNumber', '', { shouldValidate: false })
    form.clearErrors('docNumber')
  }

  const onSubmit = async (data: UpdateDocumentInput) => {
    if (!selectedCountry) {
      setError('Debes seleccionar un país')
      return
    }

    setError(null)

    startTransition(async () => {
      const result = await updateDocumentAction(data)

      if (result.success) {
        toast.success(t('success'))
        form.reset(data)
      } else {
        setError(result.error || t('error'))
        toast.error(result.error || t('error'))
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Alert variant="warning" className="mb-4">
          <AlertDescription>{t('warning')}</AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="country">{t('country.label')}</Label>
            <Select value={selectedCountry || ''} onValueChange={handleCountryChange}>
              <SelectTrigger id="country" aria-invalid={!!errors.country}>
                <SelectValue placeholder={t('country.placeholder')} />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(tOrgs.raw('countries')).map(([code, name]) => (
                  <SelectItem key={code} value={code}>
                    {String(name)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.country && <p className="text-destructive text-sm">{errors.country.message}</p>}
          </div>

          {selectedCountry && taxIdConfig && (
            <div className="space-y-2">
              <Label htmlFor="docNumber">{taxIdConfig.label}</Label>
              <Input
                id="docNumber"
                placeholder={taxIdConfig.placeholder}
                value={docValue}
                maxLength={taxIdConfig.maxLength}
                {...register('docNumber', {
                  onChange: (e) => handleDocChange(e.target.value),
                })}
                aria-invalid={!!errors.docNumber}
              />
              <p className="text-muted-foreground text-xs">{taxIdConfig.description}</p>
              {errors.docNumber && (
                <p className="text-destructive text-sm">{errors.docNumber.message}</p>
              )}
            </div>
          )}

          {error && (
            <div className="bg-destructive/10 border-destructive/20 rounded-md border p-4">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          <Button type="submit" disabled={isPending || !selectedCountry}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('save')}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
