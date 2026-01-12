'use client'

import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/src/shared/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/src/shared/ui/card'
import { AlertCircle, Home, RefreshCw } from 'lucide-react'
import { useRouter } from '@/i18n/navigation'

export default function SuperAdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useTranslations('errors')
  const router = useRouter()

  useEffect(() => {
    console.error('Super Admin error:', error)
  }, [error])

  const handleGoHome = () => {
    router.push('/')
  }

  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="bg-destructive/10 flex h-12 w-12 items-center justify-center rounded-full">
            <AlertCircle className="text-destructive h-6 w-6" />
          </div>
          <CardTitle className="mt-4">{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent>
          {error.digest && (
            <p className="text-muted-foreground text-xs">
              {t('errorId')}: {error.digest}
            </p>
          )}
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button onClick={reset} variant="default">
            <RefreshCw className="mr-2 h-4 w-4" />
            {t('tryAgain')}
          </Button>
          <Button onClick={handleGoHome} variant="outline">
            <Home className="mr-2 h-4 w-4" />
            {t('goHome')}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
