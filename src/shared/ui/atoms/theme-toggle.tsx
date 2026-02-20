'use client'

import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'

import { useIsClient } from '@/src/shared/hooks'
import { cn } from '@/src/shared/lib/utils/cn'
import { Switch } from '@/src/shared/ui/switch'

function ThemeTogglePlaceholder() {
  return (
    <div className="flex items-center gap-2" aria-hidden>
      <div className="h-4 w-4 shrink-0 rounded bg-muted/80" />
      <div className="h-[1.15rem] w-8 shrink-0 rounded-full bg-input" />
      <div className="h-4 w-4 shrink-0 rounded bg-muted/80" />
    </div>
  )
}

export function ThemeToggle() {
  const isClient = useIsClient()
  const { setTheme, resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  if (!isClient) return <ThemeTogglePlaceholder />

  return (
    <div className="flex items-center gap-2">
      <Sun
        className={cn(
          'h-4 w-4 transition-all duration-300',
          isDark ? 'opacity-40 scale-90' : 'opacity-100 scale-100 text-yellow-500'
        )}
      />
      <Switch
        checked={isDark}
        onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
        aria-label="Toggle theme"
        className="transition-all duration-300"
      />
      <Moon
        className={cn(
          'h-4 w-4 transition-all duration-300',
          isDark ? 'opacity-100 scale-100 text-blue-400' : 'opacity-40 scale-90'
        )}
      />
    </div>
  )
}
