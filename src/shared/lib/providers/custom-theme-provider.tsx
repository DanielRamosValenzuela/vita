'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'

import { getStoredThemeId, setStoredThemeId, themesList, type Theme } from '../themes'

interface CustomThemeContextType {
  currentTheme: Theme | null
  themes: Theme[]
  setTheme: (themeId: string) => void
}

const CustomThemeContext = createContext<CustomThemeContextType | undefined>(undefined)

export function CustomThemeProvider({ children }: { children: React.ReactNode }) {
  const [themes] = useState<Theme[]>(themesList)
  const [currentThemeId, setCurrentThemeId] = useState<string>('default')

  const applyThemeClass = useCallback((themeId: string) => {
    if (typeof document === 'undefined') return

    const root = document.documentElement
    themesList.forEach((theme) => {
      if (theme.id !== 'default') root.classList.remove(`theme-${theme.id}`)
    })

    if (themeId !== 'default') {
      const themeClass = `theme-${themeId}`
      root.classList.add(themeClass)
    }
  }, [])

  useEffect(() => {
    const stored = getStoredThemeId()
    if (stored) {
      setCurrentThemeId(stored)
      applyThemeClass(stored)
    }
  }, [applyThemeClass])

  const currentTheme = themes.find((t) => t.id === currentThemeId) || themesList[0]

  const setTheme = useCallback(
    (themeId: string) => {
      const theme = themes.find((t) => t.id === themeId)
      if (theme) {
        setCurrentThemeId(themeId)
        setStoredThemeId(themeId)
        applyThemeClass(themeId)
      }
    },
    [themes, applyThemeClass]
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
