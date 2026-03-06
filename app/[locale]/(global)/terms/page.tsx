import { getTranslations } from 'next-intl/server'

import { PageAnimationWrapper, PageSection } from '@/src/shared/ui/motion'

interface TermsPageProps {
  params: Promise<{ locale: string }>
}

const sections = [
  'section1',
  'section2',
  'section3',
  'section4',
  'section5',
  'section6',
  'section7',
] as const

type SectionKey = (typeof sections)[number]

export default async function TermsPage({ params }: TermsPageProps) {
  await params
  const t = await getTranslations('termsPage')

  return (
    <PageAnimationWrapper className="bg-background py-16">
      <div className="container mx-auto max-w-3xl px-4">
        <PageSection>
          <header className="mb-10">
            <h1 className="mb-2 text-4xl font-bold tracking-tight">{t('title')}</h1>
            <p className="text-muted-foreground text-sm">{t('lastUpdated')}</p>
          </header>

          <p className="text-muted-foreground mb-10 text-lg leading-relaxed">{t('intro')}</p>
        </PageSection>

        <div className="space-y-10">
          {sections.map((section) => {
            const sectionKey = section as SectionKey
            return (
              <PageSection key={section}>
                <article>
                  <h2 className="mb-3 text-xl font-semibold">{t(`${sectionKey}.title`)}</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {t(`${sectionKey}.content`)}
                  </p>
                </article>
              </PageSection>
            )
          })}
        </div>
      </div>
    </PageAnimationWrapper>
  )
}
