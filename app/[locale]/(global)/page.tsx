import { HeroSection } from '@/components/templates'

interface HomePageProps {
  params: Promise<{ locale: string }>
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params

  return <HeroSection locale={locale} />
}

