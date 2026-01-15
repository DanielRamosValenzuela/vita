'use client'

import { SessionProvider } from 'next-auth/react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'

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
      disableTransitionOnChange
    >
      <CustomThemeProvider>
        <SessionProvider>{children}</SessionProvider>
      </CustomThemeProvider>
    </NextThemesProvider>
  )
}
