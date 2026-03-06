'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { Eye, EyeOff } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'

import { Button } from '@/src/shared/ui/button'
import { GoogleIcon } from '@/src/shared/ui/icons'
import { Input } from '@/src/shared/ui/input'
import { Label } from '@/src/shared/ui/label'

import { Link } from '@/i18n/navigation'

import { loginAction } from '../api'

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const t = useTranslations('auth')
  const locale = useLocale()
  const router = useRouter()
  const resolvedCallbackUrl = callbackUrl ?? `/${locale}/dashboard`

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})
    setGeneralError(null)

    const formData = new FormData(e.currentTarget)
    const locale = window.location.pathname.split('/')[1] || 'es'
    formData.set('locale', locale)

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      const validationResult = await loginAction(formData)

      if (validationResult.success) {
        const signInResult = await signIn('credentials', {
          email,
          password,
          redirect: false,
        })

        if (signInResult?.ok) {
          router.push(resolvedCallbackUrl)
          router.refresh()
        } else setGeneralError(signInResult?.error || t('signInError'))
      } else {
        setGeneralError(validationResult.error || t('validationError'))
        setErrors(validationResult.fieldErrors || {})
      }
    } catch (error) {
      setGeneralError(error instanceof Error ? error.message : t('unexpectedError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {generalError && (
        <section
          role="alert"
          aria-live="assertive"
          className="rounded-md bg-destructive/10 p-4 text-sm text-destructive"
        >
          {generalError}
        </section>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">{t('email')}</Label>
        <Input type="email" id="email" name="email" placeholder={t('emailPlaceholder')} />
        {errors.email && (
          <p className="text-destructive text-sm" role="alert">
            {errors.email[0]}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">{t('password')}</Label>
        <div className="relative">
          <Input type={showPassword ? 'text' : 'password'} id="password" name="password" className="pr-10" />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={showPassword ? t('hidePassword') : t('showPassword')}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-destructive text-sm" role="alert">
            {errors.password[0]}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <input
            id="remember"
            name="remember"
            type="checkbox"
            className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
          />
          <Label htmlFor="remember" className="mb-0! text-sm font-normal">
            {t('rememberMe')}
          </Label>
        </div>
        <div className="text-sm">
          <Link href="/forgot-password" className="text-primary hover:underline">
            {t('forgotPassword')}
          </Link>
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? t('signingIn') : t('login')}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-card px-2 text-muted-foreground">{t('orContinueWith')}</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={() => signIn('google', { callbackUrl: resolvedCallbackUrl })}
        className="w-full"
      >
        <GoogleIcon className="mr-2 h-5 w-5" />
        {t('continueWithGoogle')}
      </Button>
    </form>
  )
}
