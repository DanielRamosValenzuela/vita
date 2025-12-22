import { redirect } from '@/i18n/navigation'
import { getCurrentUser } from '@/src/shared/lib/auth'
import { OnboardingContent } from '@/src/features/onboarding/ui'

interface OnboardingPageProps {
  params: Promise<{ locale: string }>
}

export default async function OnboardingPage({ params }: OnboardingPageProps) {
  const { locale } = await params
  const user = await getCurrentUser()

  if (!user) {
    redirect({ href: '/login', locale })
    return
  }

  if (user.organizationId) {
    redirect({ href: '/dashboard', locale })
    return
  }

  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <OnboardingContent user={user} locale={locale} />
      </div>
    </div>
  )
}
