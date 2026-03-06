import { HeroSection } from '@/src/widgets/hero-section'
import {
  BenefitsByRoleSection,
  FaqSection,
  FeaturesSection,
  FinalCtaSection,
  HowItWorksSection,
  PricingSection,
  ProblemSection,
  SocialProofBar,
  TestimonialsSection,
} from '@/src/widgets/landing'

interface HomePageProps {
  params: Promise<{ locale: string }>
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params

  return (
    <>
      <HeroSection locale={locale} />
      <SocialProofBar />
      <ProblemSection />
      <FeaturesSection />
      <HowItWorksSection />
      <BenefitsByRoleSection />
      <TestimonialsSection />
      <PricingSection />
      <FaqSection />
      <FinalCtaSection />
    </>
  )
}
