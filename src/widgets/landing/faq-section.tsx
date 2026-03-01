'use client'

import { useState } from 'react'

import { ChevronDown } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { cn } from '@/src/shared/lib/utils'
import { Badge } from '@/src/shared/ui/badge'

export function FaqSection() {
  const t = useTranslations('landing')
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  type FaqKey = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

  const items: { q: string; a: string }[] = ([1, 2, 3, 4, 5, 6, 7, 8] as FaqKey[]).map((n) => ({
    q: t(`faq.q${n}`),
    a: t(`faq.a${n}`),
  }))

  const handleToggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index))
  }

  return (
    <section className={cn('bg-muted/30 py-20')}>
      <div className="container mx-auto max-w-3xl px-4">
        <div className="mb-12 flex flex-col items-center text-center">
          <Badge variant="outline" className="mb-4">
            {t('faq.tag')}
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t('faq.title')}</h2>
        </div>

        <div className="space-y-2">
          {items.map((item, index) => {
            const isOpen = openIndex === index
            return (
              <div
                key={item.q}
                className="bg-card overflow-hidden rounded-lg border"
              >
                <button
                  type="button"
                  onClick={() => handleToggle(index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="pr-4 text-sm font-medium">{item.q}</span>
                  <ChevronDown
                    className={cn(
                      'text-muted-foreground h-4 w-4 shrink-0 transition-transform duration-200',
                      isOpen && 'rotate-180'
                    )}
                  />
                </button>
                {isOpen && (
                  <div className="border-t px-5 pb-4 pt-3">
                    <p className="text-muted-foreground text-sm leading-relaxed">{item.a}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
