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
  const [{ locale }, session, { registered, callbackUrl }] = await Promise.all([
    params,
    getServerSession(authOptions),
    searchParams,
  ])
  const t = await getTranslations({ locale, namespace: 'auth' })

  if (session) redirect(`/${locale}`)

  return (
    <main className="bg-background relative min-h-screen font-sans">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="bg-primary/5 absolute -top-40 -right-40 h-80 w-80 rounded-full blur-3xl" />
        <div className="bg-primary/5 absolute -bottom-40 -left-40 h-80 w-80 rounded-full blur-3xl" />
      </div>

      <section className="relative flex min-h-screen items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <article className="w-full max-w-md space-y-6">
          <header className="text-center">
            <h1 className="text-foreground text-3xl font-bold tracking-tight">
              {t('signInTitle')}
            </h1>
            {registered === 'true' && (
              <p
                className="mt-2 text-sm text-green-600"
                role="status"
                aria-live="polite"
              >
                {t('registrationSuccess')}
              </p>
            )}
          </header>
          <section className="bg-card rounded-xl border px-8 py-8 shadow-sm">
            <LoginForm callbackUrl={callbackUrl} />
          </section>
        </article>
      </section>
    </main>
  )
}
