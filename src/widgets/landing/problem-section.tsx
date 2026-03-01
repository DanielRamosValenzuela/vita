'use client'

import { XCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { cn } from '@/src/shared/lib/utils'
import { Badge } from '@/src/shared/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/ui/card'

export function ProblemSection() {
  const t = useTranslations('landing')

  const painPoints = [
    {
      title: t('problem.pain1.title'),
      description: t('problem.pain1.description'),
    },
    {
      title: t('problem.pain2.title'),
      description: t('problem.pain2.description'),
    },
    {
      title: t('problem.pain3.title'),
      description: t('problem.pain3.description'),
    },
    {
      title: t('problem.pain4.title'),
      description: t('problem.pain4.description'),
    },
  ]

  return (
    <section className={cn('bg-muted/30 py-20')}>
      <div className="container mx-auto max-w-5xl px-4">
        <div className="mb-12 flex flex-col items-center text-center">
          <Badge variant="outline" className="mb-4">
            {t('problem.tag')}
          </Badge>
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            {t('problem.title')}
          </h2>
          <p className="text-muted-foreground max-w-2xl text-lg">{t('problem.description')}</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {painPoints.map((pain) => (
            <Card key={pain.title} className="border-destructive/20">
              <CardHeader className="pb-2">
                <div className="mb-3 flex items-center gap-3">
                  <div className="bg-destructive/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                    <XCircle className="text-destructive h-5 w-5" />
                  </div>
                  <CardTitle className="text-base">{pain.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">{pain.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
