import { HeroSection } from '@/src/widgets/hero-section'
import {
  SocialProofBar,
  ProblemSection,
  FeaturesSection,
  HowItWorksSection,
  BenefitsByRoleSection,
  TestimonialsSection,
  PricingSection,
  FaqSection,
  FinalCtaSection,
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
