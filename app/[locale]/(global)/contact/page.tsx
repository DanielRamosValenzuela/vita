import { getTranslations } from 'next-intl/server'
import { Mail, Clock, MapPin } from 'lucide-react'

import { Button } from '@/src/shared/ui/button'
import { Card, CardContent, CardHeader } from '@/src/shared/ui/card'
import { PageAnimationWrapper, PageSection } from '@/src/shared/ui/motion'

interface ContactPageProps {
  params: Promise<{ locale: string }>
}

export default async function ContactPage({ params }: ContactPageProps) {
  await params
  const t = await getTranslations('contactPage')

  return (
    <PageAnimationWrapper className="bg-background py-16">
      <div className="container mx-auto max-w-6xl px-4">
        <PageSection className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
            {t('title')}
          </h1>
          <p className="text-muted-foreground text-lg sm:text-xl">
            {t('description')}
          </p>
        </PageSection>

        <div className="grid gap-12 lg:grid-cols-2">
          <PageSection>
            <Card className="h-full">
              <CardContent className="pt-6">
                <form aria-label={t('title')} className="space-y-5">
                  <div className="space-y-1.5">
                    <label htmlFor="contact-name" className="block text-sm font-medium">
                      {t('form.name')}
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      placeholder={t('form.namePlaceholder')}
                      disabled
                      className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="contact-email" className="block text-sm font-medium">
                      {t('form.email')}
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      placeholder={t('form.emailPlaceholder')}
                      disabled
                      className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="contact-org" className="block text-sm font-medium">
                      {t('form.org')}
                    </label>
                    <input
                      id="contact-org"
                      type="text"
                      placeholder={t('form.orgPlaceholder')}
                      disabled
                      className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="contact-message" className="block text-sm font-medium">
                      {t('form.message')}
                    </label>
                    <textarea
                      id="contact-message"
                      rows={5}
                      placeholder={t('form.messagePlaceholder')}
                      disabled
                      className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex w-full resize-none rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled>
                    {t('form.submit')}
                  </Button>

                  <p className="text-muted-foreground text-xs">
                    {t('form.disclaimer')}
                  </p>
                </form>
              </CardContent>
            </Card>
          </PageSection>

          <PageSection>
            <Card className="h-full">
              <CardHeader className="pb-2">
                <h2 className="text-xl font-semibold">{t('info.title')}</h2>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t('form.email')}</p>
                    <p className="text-muted-foreground text-sm">{t('info.email')}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">
                      {t('info.schedule')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">
                      {t('info.location')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </PageSection>
        </div>
      </div>
    </PageAnimationWrapper>
  )
}
