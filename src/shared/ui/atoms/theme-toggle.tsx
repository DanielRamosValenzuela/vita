'use client'

import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'

import { cn } from '@/src/shared/lib/utils/cn'
import { Switch } from '@/src/shared/ui/switch'

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme()

  const isDark = resolvedTheme === 'dark'

  return (
    <div className="flex items-center gap-2" suppressHydrationWarning>
      <Sun
        suppressHydrationWarning
        className={cn(
          'h-4 w-4 transition-all duration-300',
          isDark ? 'opacity-40 scale-90' : 'opacity-100 scale-100 text-yellow-500'
        )}
      />
      <Switch
        suppressHydrationWarning
        checked={isDark}
        onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
        aria-label="Toggle theme"
        className="transition-all duration-300"
      />
      <Moon
        suppressHydrationWarning
        className={cn(
          'h-4 w-4 transition-all duration-300',
          isDark ? 'opacity-100 scale-100 text-blue-400' : 'opacity-40 scale-90'
        )}
      />
    </div>
  )
}
