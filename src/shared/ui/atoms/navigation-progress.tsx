'use client'

import { useEffect, useState } from 'react'

import { usePathname } from '@/i18n/navigation'

export function NavigationProgress() {
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => setIsLoading(false), 900)
    return () => clearTimeout(timer)
  }, [pathname])

  if (!isLoading) return null

  return (
    <div
      className="fixed left-0 top-0 z-50 h-1 w-full overflow-hidden bg-transparent"
      aria-hidden="true"
    >
      <div className="h-full animate-nav-progress bg-primary">
        <div
          className="h-full w-full animate-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent"
          style={{ backgroundSize: '200% 100%' }}
        />
      </div>
    </div>
  )
}
