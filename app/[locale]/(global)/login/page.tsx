import { getServerSession } from 'next-auth/next'
import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'

import { authOptions } from '@/src/shared/lib/auth'
import { LoginForm } from '@/src/features/auth/ui'

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ callbackUrl?: string; registered?: string }>
}) {
  const { locale } = await params
  const session = await getServerSession(authOptions)
  const t = await getTranslations({ locale, namespace: 'auth' })

  if (session) redirect(`/${locale}`)

  const { registered } = await searchParams

  return (
    <main className="bg-background fixed inset-0 overflow-y-auto font-sans">
      <section className="flex min-h-full items-start justify-center px-4 pt-16 pb-20 sm:px-6 lg:px-8">
        <article className="w-full max-w-md space-y-8 py-8">
          <header>
            <h1 className="text-foreground mt-6 text-center text-3xl font-bold tracking-tight">
              {t('signInTitle')}
            </h1>
            {registered === 'true' && (
              <p
                className="mt-2 text-center text-sm text-green-600"
                role="status"
                aria-live="polite"
              >
                {t('registrationSuccess')}
              </p>
            )}
          </header>
          <section className="bg-card rounded-lg px-8 py-8 shadow">
            <LoginForm />
          </section>
        </article>
      </section>
    </main>
  )
}
