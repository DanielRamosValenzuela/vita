'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useTheme } from 'next-themes'

import { getStoredThemeId, predefinedThemes, setStoredThemeId, type Theme } from '../themes'

interface CustomThemeContextType {
  currentTheme: Theme | null
  themes: Theme[]
  setTheme: (themeId: string) => void
}

const CustomThemeContext = createContext<CustomThemeContextType | undefined>(undefined)

export function CustomThemeProvider({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme()
  const [themes] = useState<Theme[]>(predefinedThemes)
  const [currentThemeId, setCurrentThemeId] = useState<string>('default')

  useEffect(() => {
    const stored = getStoredThemeId()
    if (stored) setCurrentThemeId(stored)
  }, [])

  const currentTheme = themes.find((t) => t.id === currentThemeId) || predefinedThemes[0]

  const applyTheme = useCallback(
    (theme: Theme) => {
      if (typeof document === 'undefined') return

      const root = document.documentElement
      const isDark = resolvedTheme === 'dark'
      const vars = isDark ? theme.dark : theme.light

      if (theme.id === 'default') {
        Object.keys(vars).forEach((key) => {
          root.style.removeProperty(key)
        })
      } else {
        Object.entries(vars).forEach(([key, value]) => {
          root.style.setProperty(key, value)
        })
      }
    },
    [resolvedTheme]
  )

  useEffect(() => {
    applyTheme(currentTheme)
  }, [currentTheme, applyTheme])

  const setTheme = useCallback(
    (themeId: string) => {
      const theme = themes.find((t) => t.id === themeId)
      if (theme) {
        setCurrentThemeId(themeId)
        setStoredThemeId(themeId)
        applyTheme(theme)
      }
    },
    [themes, applyTheme]
  )

  return (
    <CustomThemeContext.Provider
      value={{
        currentTheme,
        themes,
        setTheme,
      }}
    >
      {children}
    </CustomThemeContext.Provider>
  )
}

export function useCustomTheme() {
  const context = useContext(CustomThemeContext)
  if (context === undefined)
    throw new Error('useCustomTheme must be used within CustomThemeProvider')
  return context
}
