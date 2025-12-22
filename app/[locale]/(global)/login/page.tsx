import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth/config'
import { LoginForm } from '@/components/molecules'

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ callbackUrl?: string; registered?: string }>
}) {
  const { locale } = await params
  const session = await getServerSession(authOptions)

  if (session) {
    redirect(`/${locale}`)
  }

  const { registered } = await searchParams

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Inicia sesión en tu cuenta
          </h2>
          {registered === 'true' && (
            <p className="mt-2 text-center text-sm text-green-600">
              ✅ Registro exitoso. Por favor, inicia sesión.
            </p>
          )}
        </div>
        <div className="rounded-lg bg-white px-8 py-8 shadow">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}


