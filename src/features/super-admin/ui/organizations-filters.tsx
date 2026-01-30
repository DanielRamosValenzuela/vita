'use client'

import { useTranslations } from 'next-intl'
import type { Country, OrganizationPlan, OrganizationStatus } from '@prisma/client'
import { Search, X } from 'lucide-react'

import { Badge } from '@/src/shared/ui/badge'
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

  const hasActiveFilters = status !== 'ALL' || plan !== 'ALL' || country !== 'ALL' || search

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

      <div className="flex flex-col gap-4 md:flex-row md:items-start">
        {hasActiveFilters && (
          <div className="bg-muted/50 flex flex-wrap items-center gap-2 rounded-lg border p-3 md:min-w-[200px] md:flex-shrink-0">
            <span className="text-muted-foreground text-sm font-medium">
              {t('filters.filteringBy')}:
            </span>
            <div className="flex flex-wrap gap-2">
              {search && (
                <Badge variant="secondary" className="gap-1">
                  {t('filters.search')}: {search}
                  <button
                    onClick={() => onSearchChange('')}
                    className="hover:bg-muted-foreground/20 rounded-full p-0.5 transition-colors"
                    aria-label={t('filters.removeSearch')}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {status !== 'ALL' && (
                <Badge variant="secondary" className="gap-1">
                  {t('filters.status')}: {t(`statuses.${status}`)}
                  <button
                    onClick={() => onStatusChange('ALL')}
                    className="hover:bg-muted-foreground/20 rounded-full p-0.5 transition-colors"
                    aria-label={t('filters.removeStatus')}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {plan !== 'ALL' && (
                <Badge variant="secondary" className="gap-1">
                  {t('filters.plan')}: {t(`plans.${plan}`)}
                  <button
                    onClick={() => onPlanChange('ALL')}
                    className="hover:bg-muted-foreground/20 rounded-full p-0.5 transition-colors"
                    aria-label={t('filters.removePlan')}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {country !== 'ALL' && (
                <Badge variant="secondary" className="gap-1">
                  {t('filters.country')}: {t(`countries.${country}`)}
                  <button
                    onClick={() => onCountryChange('ALL')}
                    className="hover:bg-muted-foreground/20 rounded-full p-0.5 transition-colors"
                    aria-label={t('filters.removeCountry')}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          </div>
        )}
        <div className="grid flex-1 gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="filter-status">{t('filters.status')}</Label>
            <Select value={status} onValueChange={onStatusChange}>
              <SelectTrigger id="filter-status">
                <SelectValue placeholder={t('filters.all')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{t('filters.all')}</SelectItem>
                <SelectItem value="ACTIVE">{t('statuses.ACTIVE')}</SelectItem>
                <SelectItem value="PENDING_PAYMENT">{t('statuses.PENDING_PAYMENT')}</SelectItem>
                <SelectItem value="SUSPENDED">{t('statuses.SUSPENDED')}</SelectItem>
                <SelectItem value="INACTIVE">{t('statuses.INACTIVE')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="filter-plan">{t('filters.plan')}</Label>
            <Select value={plan} onValueChange={onPlanChange}>
              <SelectTrigger id="filter-plan">
                <SelectValue placeholder={t('filters.all')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{t('filters.all')}</SelectItem>
                <SelectItem value="BASIC">{t('plans.BASIC')}</SelectItem>
                <SelectItem value="PRO">{t('plans.PRO')}</SelectItem>
                <SelectItem value="ENTERPRISE">{t('plans.ENTERPRISE')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="filter-country">{t('filters.country')}</Label>
            <Select value={country} onValueChange={onCountryChange}>
              <SelectTrigger id="filter-country">
                <SelectValue placeholder={t('filters.all')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{t('filters.all')}</SelectItem>
                <SelectItem value="CL">{t('countries.CL')}</SelectItem>
                <SelectItem value="AR">{t('countries.AR')}</SelectItem>
                <SelectItem value="PE">{t('countries.PE')}</SelectItem>
                <SelectItem value="CO">{t('countries.CO')}</SelectItem>
                <SelectItem value="MX">{t('countries.MX')}</SelectItem>
                <SelectItem value="US">{t('countries.US')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button variant="outline" onClick={onReset} className="w-full">
              {t('filters.reset')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
