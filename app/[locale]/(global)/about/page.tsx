import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { Lightbulb, Shield, Users } from 'lucide-react'

import { Button } from '@/src/shared/ui/button'
import { Card, CardContent, CardHeader } from '@/src/shared/ui/card'
import { PageAnimationWrapper, PageSection } from '@/src/shared/ui/motion'

interface AboutPageProps {
  params: Promise<{ locale: string }>
}

const values = [
  { key: 'value1', Icon: Lightbulb },
  { key: 'value2', Icon: Shield },
  { key: 'value3', Icon: Users },
] as const

type ValueKey = 'value1' | 'value2' | 'value3'

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params
  const t = await getTranslations('aboutPage')

  return (
    <PageAnimationWrapper className="flex flex-col">
      <PageSection className="bg-background py-20 text-center">
        <div className="container mx-auto max-w-4xl px-4">
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
            {t('title')}
          </h1>
          <p className="text-muted-foreground text-lg sm:text-xl">
            {t('description')}
          </p>
        </div>
      </PageSection>

      <PageSection className="bg-primary/5 py-20">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <h2 className="mb-6 text-3xl font-bold tracking-tight">
            {t('mission.title')}
          </h2>
          <p className="text-muted-foreground text-xl leading-relaxed">
            {t('mission.description')}
          </p>
        </div>
      </PageSection>

      <PageSection className="bg-background py-20">
        <div className="container mx-auto max-w-4xl px-4">
          <h2 className="mb-10 text-3xl font-bold tracking-tight">
            {t('story.title')}
          </h2>
          <div className="space-y-6">
            <p className="text-muted-foreground text-lg leading-relaxed">
              {t('story.p1')}
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed">
              {t('story.p2')}
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed">
              {t('story.p3')}
            </p>
          </div>
        </div>
      </PageSection>

      <PageSection className="bg-muted/30 py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <h2 className="mb-12 text-center text-3xl font-bold tracking-tight">
            {t('values.title')}
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {values.map((value) => {
              const { Icon, key } = value
              const valueKey = key as ValueKey
              return (
                <Card key={key} className="text-center transition-shadow hover:shadow-lg">
                  <CardHeader className="items-center pb-2">
                    <div className="bg-primary/10 text-primary mb-4 flex h-14 w-14 items-center justify-center rounded-2xl">
                      <Icon className="h-7 w-7" />
                    </div>
                    <h3 className="text-xl font-semibold">
                      {t(`values.${valueKey}.title`)}
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {t(`values.${valueKey}.description`)}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </PageSection>

      <PageSection className="bg-background py-20 text-center">
        <div className="container mx-auto max-w-3xl px-4">
          <h2 className="mb-4 text-3xl font-bold tracking-tight">
            {t('cta.title')}
          </h2>
          <p className="text-muted-foreground mb-8 text-lg">
            {t('cta.description')}
          </p>
          <Button asChild size="lg" className="text-base">
            <Link href={`/${locale}/contact`}>{t('cta.button')}</Link>
          </Button>
        </div>
      </PageSection>
    </PageAnimationWrapper>
  )
}
