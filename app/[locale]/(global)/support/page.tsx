import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { Rocket, Calendar, CreditCard, UserCircle, ChevronRight } from 'lucide-react'

import { Button } from '@/src/shared/ui/button'
import { Card, CardContent, CardHeader } from '@/src/shared/ui/card'
import { PageAnimationWrapper, PageSection } from '@/src/shared/ui/motion'

interface SupportPageProps {
  params: Promise<{ locale: string }>
}

const categories = [
  { key: 'gettingStarted', Icon: Rocket },
  { key: 'shifts', Icon: Calendar },
  { key: 'payments', Icon: CreditCard },
  { key: 'account', Icon: UserCircle },
] as const

const categoryItems = ['item1', 'item2', 'item3', 'item4'] as const

type CategoryKey = 'gettingStarted' | 'shifts' | 'payments' | 'account'

export default async function SupportPage({ params }: SupportPageProps) {
  const { locale } = await params
  const t = await getTranslations('supportPage')

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

      <PageSection className="bg-muted/30 py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid gap-8 sm:grid-cols-2">
            {categories.map((category) => {
              const { Icon, key } = category
              const categoryKey = key as CategoryKey
              return (
                <Card key={key} className="transition-shadow hover:shadow-lg">
                  <CardHeader className="pb-3">
                    <div className="mb-2 flex items-center gap-3">
                      <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h2 className="text-xl font-semibold">
                        {t(`categories.${categoryKey}.title`)}
                      </h2>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {t(`categories.${categoryKey}.description`)}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {categoryItems.map((item) => (
                        <li key={item} className="flex items-center gap-2">
                          <ChevronRight className="text-primary h-4 w-4 shrink-0" />
                          <span className="text-sm">
                            {t(`categories.${categoryKey}.${item}`)}
                          </span>
                        </li>
                      ))}
                    </ul>
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
            {t('contact.title')}
          </h2>
          <p className="text-muted-foreground mb-8 text-lg">
            {t('contact.description')}
          </p>
          <Button asChild size="lg" className="text-base">
            <Link href={`/${locale}/contact`}>{t('contact.button')}</Link>
          </Button>
        </div>
      </PageSection>
    </PageAnimationWrapper>
  )
}
