import * as React from 'react'

import { cn } from '@/src/shared/lib/utils/cn'

function Skeleton({
  className,
  variant = 'pulse',
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { variant?: 'pulse' | 'wave' }) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        'rounded-md',
        variant === 'wave' ? 'animate-skeleton-wave' : 'bg-accent animate-pulse',
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
