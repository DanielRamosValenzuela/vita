'use client'

import { useState, useTransition } from 'react'
import type { Country, OrganizationPlan, OrganizationStatus } from '@prisma/client'

import { usePathname, useRouter } from '@/i18n/navigation'

interface OrganizationFiltersState {
  search: string
  status: OrganizationStatus | 'ALL'
  plan: OrganizationPlan | 'ALL'
  country: Country | 'ALL'
}

interface UseOrganizationFiltersReturn {
  search: string
  status: OrganizationStatus | 'ALL'
  plan: OrganizationPlan | 'ALL'
  country: Country | 'ALL'
  pathname: string
  setSearch: (value: string) => void
  setStatus: (value: OrganizationStatus | 'ALL') => void
  setPlan: (value: OrganizationPlan | 'ALL') => void
  setCountry: (value: Country | 'ALL') => void
  handleFilterChange: (newFilters: Partial<OrganizationFiltersState>) => void
  handleReset: () => void
  isPending: boolean
  startTransition: ReturnType<typeof useTransition>[1]
}

export function useOrganizationFilters(
  initialFilters: OrganizationFiltersState
): UseOrganizationFiltersReturn {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  const [search, setSearch] = useState(initialFilters.search)
  const [status, setStatus] = useState<OrganizationStatus | 'ALL'>(initialFilters.status)
  const [plan, setPlan] = useState<OrganizationPlan | 'ALL'>(initialFilters.plan)
  const [country, setCountry] = useState<Country | 'ALL'>(initialFilters.country)

  const handleFilterChange = (newFilters: Partial<OrganizationFiltersState>) => {
    const merged: OrganizationFiltersState = {
      search,
      status,
      plan,
      country,
      ...newFilters,
    }

    const params = new URLSearchParams()

    if (merged.search) params.set('search', merged.search)
    if (merged.status && merged.status !== 'ALL') params.set('status', merged.status)
    if (merged.plan && merged.plan !== 'ALL') params.set('plan', merged.plan)
    if (merged.country && merged.country !== 'ALL') params.set('country', merged.country)

    params.set('page', '1')

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  const handleReset = () => {
    setSearch('')
    setStatus('ALL')
    setPlan('ALL')
    setCountry('ALL')

    startTransition(() => {
      router.push(pathname)
    })
  }

  return {
    search,
    status,
    plan,
    country,
    pathname,
    setSearch,
    setStatus,
    setPlan,
    setCountry,
    handleFilterChange,
    handleReset,
    isPending,
    startTransition,
  }
}
