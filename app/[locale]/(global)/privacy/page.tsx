import { getTranslations } from 'next-intl/server'

interface PrivacyPageProps {
  params: Promise<{ locale: string }>
}

const sections = [
  'section1',
  'section2',
  'section3',
  'section4',
  'section5',
  'section6',
] as const

type SectionKey = (typeof sections)[number]

export default async function PrivacyPage({ params }: PrivacyPageProps) {
  await params
  const t = await getTranslations('privacyPage')

  return (
    <div className="bg-background py-16">
      <div className="container mx-auto max-w-3xl px-4">
        <header className="mb-10">
          <h1 className="mb-2 text-4xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground text-sm">{t('lastUpdated')}</p>
        </header>

        <p className="text-muted-foreground mb-10 text-lg leading-relaxed">
          {t('intro')}
        </p>

        <div className="space-y-10">
          {sections.map((section) => {
            const sectionKey = section as SectionKey
            return (
              <article key={section}>
                <h2 className="mb-3 text-xl font-semibold">
                  {t(`${sectionKey}.title`)}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t(`${sectionKey}.content`)}
                </p>
              </article>
            )
          })}
        </div>
      </div>
    </div>
  )
}
