'use client'

import { useEffect, useState } from 'react'

import { usePathname } from '@/i18n/navigation'

export function NavigationProgress() {
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    setIsLoading(true)
    setProgress(0)

    const timer1 = setTimeout(() => setProgress(30), 100)
    const timer2 = setTimeout(() => setProgress(60), 300)
    const timer3 = setTimeout(() => setProgress(90), 500)

    const finishTimer = setTimeout(() => {
      setProgress(100)
      setTimeout(() => {
        setIsLoading(false)
        setProgress(0)
      }, 200)
    }, 600)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(finishTimer)
    }
  }, [pathname])

  if (!isLoading) return null

  return (
    <div
      className="fixed left-0 top-0 z-50 h-1 w-full overflow-hidden bg-transparent"
      aria-hidden="true"
    >
      <div
        className="h-full bg-primary transition-all duration-300 ease-out"
        style={{
          width: `${progress}%`,
          transition: 'width 0.2s ease-out',
        }}
      >
        <div
          className="h-full w-full animate-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent"
          style={{
            backgroundSize: '200% 100%',
          }}
        />
      </div>
    </div>
  )
}
