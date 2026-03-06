'use client'

import { useEffect, useState } from 'react'

interface UseCounterAnimationOptions {
  target: number
  duration?: number
  isInView: boolean
}

export function useCounterAnimation({
  target,
  duration = 2,
  isInView,
}: UseCounterAnimationOptions): string {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isInView) return

    const startTime = performance.now()
    const durationMs = duration * 1000

    function update() {
      const elapsed = performance.now() - startTime
      const progress = Math.min(elapsed / durationMs, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))

      if (progress < 1)
        requestAnimationFrame(update)
    }

    requestAnimationFrame(update)
  }, [isInView, target, duration])

  return count.toLocaleString()
}
