import { Loader2 } from 'lucide-react'

import { cn } from '@/src/shared/lib/utils/cn'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeMap = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
}

export function Spinner({ size = 'sm', className }: SpinnerProps) {
  return <Loader2 aria-hidden="true" className={cn('animate-spin', sizeMap[size], className)} />
}
