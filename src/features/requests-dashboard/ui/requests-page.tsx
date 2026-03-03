'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import type { Role } from '@prisma/client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/shared/ui/tabs'

import { SwapList } from '@/src/features/shift-swap/ui/swap-list'
import { SwapChiefReview } from '@/src/features/shift-swap/ui/swap-chief-review'
import { ExtraShiftList } from '@/src/features/extra-shifts/ui/extra-shift-list'
import { ApplicationsReview } from '@/src/features/extra-shifts/ui/applications-review'

interface RequestsPageProps {
  showApprovals: boolean
  userRole: Role
}

export function RequestsPage({ showApprovals, userRole }: RequestsPageProps) {
  const t = useTranslations('requests')
  const [activeTab, setActiveTab] = useState('swaps')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tab = params.get('tab')
    if (tab && ['swaps', 'extraShifts', 'approvals'].includes(tab))
      setActiveTab(tab)
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="swaps">{t('tabs.swaps')}</TabsTrigger>
          <TabsTrigger value="extraShifts">{t('tabs.extraShifts')}</TabsTrigger>
          {showApprovals && (
            <TabsTrigger value="approvals">{t('tabs.approvals')}</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="swaps" className="mt-4">
          <SwapList />
        </TabsContent>

        <TabsContent value="extraShifts" className="mt-4">
          <ExtraShiftList userRole={userRole} />
        </TabsContent>

        {showApprovals && (
          <TabsContent value="approvals" className="mt-4">
            <div className="space-y-8">
              <SwapChiefReview />
              <ApplicationsReview />
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
