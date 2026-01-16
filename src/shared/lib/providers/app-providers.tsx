'use client'

import { SessionProvider } from 'next-auth/react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { Toaster } from 'sonner'

import { NavigationProgress } from '@/src/shared/ui/atoms'

import { CustomThemeProvider } from './custom-theme-provider'

interface AppProvidersProps {
  children: React.ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false}
    >
      <CustomThemeProvider>
        <SessionProvider>
          <NavigationProgress />
          <Toaster position="top-right" richColors closeButton />
          {children}
        </SessionProvider>
      </CustomThemeProvider>
    </NextThemesProvider>
  )
}
