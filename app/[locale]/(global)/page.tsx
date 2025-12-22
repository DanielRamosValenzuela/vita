import { HeroSection } from '@/src/widgets/hero-section'

interface HomePageProps {
  params: Promise<{ locale: string }>
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params

  return <HeroSection locale={locale} />
}

