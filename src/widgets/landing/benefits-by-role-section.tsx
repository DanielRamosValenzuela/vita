'use client'

import { useState } from 'react'

import { CheckCircle2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { cn } from '@/src/shared/lib/utils'
import { Badge } from '@/src/shared/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/src/shared/ui/tabs'

type RoleKey = 'hr' | 'chief' | 'staff'

export function BenefitsByRoleSection() {
  const t = useTranslations('landing')
  const [activeTab, setActiveTab] = useState<RoleKey>('hr')

  const tabs: { key: RoleKey; label: string }[] = [
    { key: 'hr', label: t('benefits.hr.tab') },
    { key: 'chief', label: t('benefits.chief.tab') },
    { key: 'staff', label: t('benefits.staff.tab') },
  ]

  const content: Record<
    RoleKey,
    { title: string; description: string; benefits: string[] }
  > = {
    hr: {
      title: t('benefits.hr.title'),
      description: t('benefits.hr.description'),
      benefits: [
        t('benefits.hr.benefit1'),
        t('benefits.hr.benefit2'),
        t('benefits.hr.benefit3'),
        t('benefits.hr.benefit4'),
        t('benefits.hr.benefit5'),
      ],
    },
    chief: {
      title: t('benefits.chief.title'),
      description: t('benefits.chief.description'),
      benefits: [
        t('benefits.chief.benefit1'),
        t('benefits.chief.benefit2'),
        t('benefits.chief.benefit3'),
        t('benefits.chief.benefit4'),
        t('benefits.chief.benefit5'),
      ],
    },
    staff: {
      title: t('benefits.staff.title'),
      description: t('benefits.staff.description'),
      benefits: [
        t('benefits.staff.benefit1'),
        t('benefits.staff.benefit2'),
        t('benefits.staff.benefit3'),
        t('benefits.staff.benefit4'),
        t('benefits.staff.benefit5'),
      ],
    },
  }

  const active = content[activeTab]

  return (
    <section className={cn('bg-background py-20')}>
      <div className="container mx-auto max-w-4xl px-4">
        <div className="mb-12 flex flex-col items-center text-center">
          <Badge variant="outline" className="mb-4">
            {t('benefits.tag')}
          </Badge>
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            {t('benefits.title')}
          </h2>
          <p className="text-muted-foreground max-w-2xl text-lg">{t('benefits.description')}</p>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as RoleKey)}
          className="w-full"
        >
          <div className="mb-8 flex justify-center">
            <TabsList className="w-full max-w-sm">
              {tabs.map((tab) => (
                <TabsTrigger key={tab.key} value={tab.key} className="flex-1 text-xs sm:text-sm">
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </Tabs>

        <div className="bg-card rounded-xl border p-8 shadow-sm">
          <h3 className="mb-2 text-xl font-semibold">{active.title}</h3>
          <p className="text-muted-foreground mb-6 text-sm">{active.description}</p>
          <ul className="space-y-3">
            {active.benefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-3">
                <CheckCircle2 className="text-primary mt-0.5 h-5 w-5 shrink-0" />
                <span className="text-sm">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
