'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'

import { cn } from '@/src/shared/lib/utils'

interface LogoProps {
  className?: string
  showText?: boolean
  size?: 'sm' | 'md' | 'lg'
  locale?: string
}

export function Logo({ className, showText = true, size = 'md', locale = 'es' }: LogoProps) {
  const t = useTranslations('common')
  const sizeClasses = {
    sm: 'h-6 w-6 text-lg',
    md: 'h-8 w-8 text-xl',
    lg: 'h-12 w-12 text-3xl',
  }

  return (
    <Link
      href={`/${locale}`}
      className={cn(
        'flex items-center gap-2 font-bold transition-opacity hover:opacity-80',
        className
      )}
      aria-label={t('logoLabel')}
    >
      <span
        className={cn(
          'bg-primary text-primary-foreground flex items-center justify-center rounded-lg',
          sizeClasses[size]
        )}
      >
        🏥
      </span>
      {showText && (
        <span
          className={cn(
            'text-foreground font-semibold',
            size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-base' : 'text-xl'
          )}
        >
          {t('appName')}
        </span>
      )}
    </Link>
  )
}
