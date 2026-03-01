'use client'

import { SessionProvider } from 'next-auth/react'
import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes'
import { Toaster } from 'sonner'

import { NavigationProgress } from '@/src/shared/ui/atoms'

import { CustomThemeProvider } from './custom-theme-provider'

function ThemedToaster() {
  const { resolvedTheme } = useTheme()
  const toasterTheme: 'light' | 'dark' | 'system' =
    (resolvedTheme as 'light' | 'dark') ?? 'system'
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      visibleToasts={4}
      theme={toasterTheme}
      toastOptions={{ duration: 3000 }}
    />
  )
}

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
          <ThemedToaster />
          {children}
        </SessionProvider>
      </CustomThemeProvider>
    </NextThemesProvider>
  )
}
