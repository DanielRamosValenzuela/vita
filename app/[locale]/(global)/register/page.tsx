import { getServerSession } from 'next-auth/next'
import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'

import { authOptions } from '@/src/shared/lib/auth'
import { RegisterForm } from '@/src/features/auth/ui'

export default async function RegisterPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const [session, t] = await Promise.all([
    getServerSession(authOptions),
    getTranslations({ locale, namespace: 'auth' }),
  ])

  if (session) redirect(`/${locale}`)

  return (
    <main className="bg-background fixed inset-0 overflow-y-auto font-sans">
      <section className="flex min-h-full items-start justify-center px-4 pt-16 pb-20 sm:px-6 lg:px-8">
        <article className="w-full max-w-md space-y-8 py-8">
          <header>
            <h1 className="text-foreground mt-6 text-center text-3xl font-bold tracking-tight">
              {t('createAccountTitle')}
            </h1>
            <p className="text-muted-foreground mt-2 text-center text-sm">
              {t('createAccountSubtitle')}
            </p>
          </header>
          <section className="bg-card rounded-lg px-8 py-8 pb-12 shadow">
            <RegisterForm />
          </section>
        </article>
      </section>
    </main>
  )
}
