'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Building2, Loader2 } from 'lucide-react'

import type { ActionResult } from '@/src/shared/lib/types'
import { Badge } from '@/src/shared/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/shared/ui/card'

import { getUserOrganizationsAction } from '../api/profile-actions'

interface Organization {
  id: string
  name: string
  taxId: string
  status: string
}

interface UserOrganizationsData {
  organization: Organization | null
  invitations: Array<{
    id: string
    organization: Organization
    acceptedAt: Date | null
  }>
}

export function OrganizationsSection() {
  const t = useTranslations('profile.organizations')
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadOrganizations = async () => {
      setLoading(true)
      const result = (await getUserOrganizationsAction()) as ActionResult<UserOrganizationsData>
      if (result.success && result.data) {
        const orgs: Organization[] = []
        const data = result.data as UserOrganizationsData

        if (data.organization) 
          orgs.push(data.organization)
        

        data.invitations.forEach((inv) => {
          if (!orgs.find((o) => o.id === inv.organization.id)) 
            orgs.push(inv.organization)
          
        })

        setOrganizations(orgs)
      }
      setLoading(false)
    }
    loadOrganizations()
  }, [])

  if (loading) 
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  

  if (organizations.length === 0) 
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">{t('empty')}</p>
        </CardContent>
      </Card>
    )
  

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      ACTIVE: 'default',
      PENDING_PAYMENT: 'secondary',
      SUSPENDED: 'destructive',
      INACTIVE: 'outline',
    }

    return (
      <Badge variant={variants[status] || 'outline'}>
        {t(
          `statuses.${status}` as
            | 'statuses.ACTIVE'
            | 'statuses.PENDING_PAYMENT'
            | 'statuses.SUSPENDED'
            | 'statuses.INACTIVE'
        )}
      </Badge>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {organizations.map((org) => (
          <div key={org.id} className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                <Building2 className="text-primary h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">{org.name}</p>
                <p className="text-muted-foreground text-sm">{org.taxId}</p>
              </div>
            </div>
            <div>{getStatusBadge(org.status)}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
