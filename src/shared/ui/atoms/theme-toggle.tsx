'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/src/shared/ui/button'

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="h-9 w-9 cursor-pointer"
      aria-label="Toggle theme"
      suppressHydrationWarning
    >
      <span suppressHydrationWarning>
        {resolvedTheme === 'dark' ? (
          <Sun className="h-4 w-4 transition-all" />
        ) : (
          <Moon className="h-4 w-4 transition-all" />
        )}
      </span>
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
