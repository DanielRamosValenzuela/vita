import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/src/shared/lib/utils'
import { Skeleton } from '@/src/shared/ui/skeleton'

const buttonSkeletonVariants = cva('rounded-md', {
  variants: {
    size: {
      default: 'h-9 w-24',
      sm: 'h-8 w-20',
      lg: 'h-12 w-32',
      icon: 'size-9',
      'icon-sm': 'size-8',
      'icon-lg': 'size-10',
    },
  },
  defaultVariants: {
    size: 'default',
  },
})

interface ButtonSkeletonProps extends VariantProps<typeof buttonSkeletonVariants> {
  className?: string
}

export function ButtonSkeleton({ size, className }: ButtonSkeletonProps) {
  return <Skeleton className={cn(buttonSkeletonVariants({ size }), className)} />
}
