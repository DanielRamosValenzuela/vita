'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'

export default function TestAuthPage() {
  const t = useTranslations('auth')
  const tCommon = useTranslations('common')
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg">{tCommon('loading')}</p>
      </div>
    )
  }

  if (session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">✅ {t('authenticated')}</h1>
        <div className="rounded-lg border p-6">
          <p>
            <strong>{t('email')}:</strong> {session.user.email}
          </p>
          <p>
            <strong>{t('name')}:</strong> {session.user.name}
          </p>
          <p>
            <strong>{t('id')}:</strong> {session.user.id}
          </p>
          <p>
            <strong>{t('role')}:</strong> {session.user.role}
          </p>
        </div>
        <button
          onClick={() => signOut()}
          className="rounded-md bg-red-500 px-4 py-2 text-white hover:bg-red-600"
        >
          {t('signOut')}
        </button>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">🔒 {t('notAuthenticated')}</h1>
      <button
        onClick={() => signIn('google')}
        className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
      >
        {t('signIn')}
      </button>
    </div>
  )
}

