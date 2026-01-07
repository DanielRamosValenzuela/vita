'use client'

import { useTranslations } from 'next-intl'
import { Search } from 'lucide-react'
import { Input } from '@/src/shared/ui/input'
import { Button } from '@/src/shared/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/shared/ui/select'
import type { OrganizationStatus, OrganizationPlan, Country } from '@prisma/client'

interface OrganizationsFiltersProps {
  search: string
  status: OrganizationStatus | 'ALL'
  plan: OrganizationPlan | 'ALL'
  country: Country | 'ALL'
  onSearchChange: (value: string) => void
  onStatusChange: (value: OrganizationStatus | 'ALL') => void
  onPlanChange: (value: OrganizationPlan | 'ALL') => void
  onCountryChange: (value: Country | 'ALL') => void
  onReset: () => void
}

export function OrganizationsFilters({
  search,
  status,
  plan,
  country,
  onSearchChange,
  onStatusChange,
  onPlanChange,
  onCountryChange,
  onReset,
}: OrganizationsFiltersProps) {
  const t = useTranslations('superAdmin.organizations')

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          type="text"
          placeholder={t('search')}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger>
            <SelectValue placeholder={t('filters.status')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t('filters.all')}</SelectItem>
            <SelectItem value="ACTIVE">{t('statuses.ACTIVE')}</SelectItem>
            <SelectItem value="PENDING_PAYMENT">{t('statuses.PENDING_PAYMENT')}</SelectItem>
            <SelectItem value="SUSPENDED">{t('statuses.SUSPENDED')}</SelectItem>
            <SelectItem value="INACTIVE">{t('statuses.INACTIVE')}</SelectItem>
          </SelectContent>
        </Select>

        <Select value={plan} onValueChange={onPlanChange}>
          <SelectTrigger>
            <SelectValue placeholder={t('filters.plan')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t('filters.all')}</SelectItem>
            <SelectItem value="BASIC">{t('plans.BASIC')}</SelectItem>
            <SelectItem value="PRO">{t('plans.PRO')}</SelectItem>
            <SelectItem value="ENTERPRISE">{t('plans.ENTERPRISE')}</SelectItem>
          </SelectContent>
        </Select>

        <Select value={country} onValueChange={onCountryChange}>
          <SelectTrigger>
            <SelectValue placeholder={t('filters.country')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t('filters.all')}</SelectItem>
            <SelectItem value="CL">{t('countries.CL')}</SelectItem>
            <SelectItem value="AR">{t('countries.AR')}</SelectItem>
            <SelectItem value="PE">{t('countries.PE')}</SelectItem>
            <SelectItem value="CO">{t('countries.CO')}</SelectItem>
            <SelectItem value="MX">{t('countries.MX')}</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={onReset} className="w-full">
          {t('filters.reset')}
        </Button>
      </div>
    </div>
  )
}
