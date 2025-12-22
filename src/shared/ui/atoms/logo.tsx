import Link from 'next/link'
import { cn } from '@/shared/lib/utils/cn'

interface LogoProps {
  className?: string
  showText?: boolean
  size?: 'sm' | 'md' | 'lg'
  locale?: string
}

export function Logo({ className, showText = true, size = 'md', locale = 'es' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-6 w-6 text-lg',
    md: 'h-8 w-8 text-xl',
    lg: 'h-12 w-12 text-3xl',
  }

  return (
    <Link
      href={`/${locale}`}
      className={cn('flex items-center gap-2 font-bold transition-opacity hover:opacity-80', className)}
      aria-label="VITA - Inicio"
    >
      <span className={cn('flex items-center justify-center rounded-lg bg-primary text-primary-foreground', sizeClasses[size])}>
        🏥
      </span>
      {showText && (
        <span className={cn('font-semibold text-foreground', size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-base' : 'text-xl')}>
          VITA
        </span>
      )}
    </Link>
  )
}


