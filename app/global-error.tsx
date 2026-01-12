'use client'

import { useEffect } from 'react'
import { Button } from '@/src/shared/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/src/shared/ui/card'
import { AlertCircle, Home } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  return (
    <html>
      <body>
        <div className="bg-background flex min-h-screen items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="bg-destructive/10 flex h-12 w-12 items-center justify-center rounded-full">
                <AlertCircle className="text-destructive h-6 w-6" />
              </div>
              <CardTitle className="mt-4">Algo salió mal</CardTitle>
              <CardDescription>
                Ha ocurrido un error inesperado. Por favor, intenta nuevamente o regresa al inicio.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error.digest && (
                <p className="text-muted-foreground text-xs">Error ID: {error.digest}</p>
              )}
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button onClick={reset} variant="default">
                Intentar de nuevo
              </Button>
              <Button onClick={() => (window.location.href = '/')} variant="outline">
                <Home className="mr-2 h-4 w-4" />
                Ir al inicio
              </Button>
            </CardFooter>
          </Card>
        </div>
      </body>
    </html>
  )
}
