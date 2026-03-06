'use client'

import { useTranslations } from 'next-intl'
import Image from 'next/image'
import Link from 'next/link'

import { cn } from '@/src/shared/lib/utils'

interface LogoProps {
  className?: string
  showText?: boolean
  size?: 'sm' | 'md' | 'lg'
  locale?: string
}

const sizeConfig = {
  sm: { icon: 24, text: 'text-base' },
  md: { icon: 32, text: 'text-xl' },
  lg: { icon: 48, text: 'text-2xl' },
}

export function Logo({ className, showText = true, size = 'md', locale = 'es' }: LogoProps) {
  const t = useTranslations('common')
  const config = sizeConfig[size]

  return (
    <Link
      href={`/${locale}`}
      className={cn(
        'flex items-center gap-2 font-bold transition-opacity hover:opacity-80',
        className
      )}
      aria-label={t('logoLabel')}
    >
      <Image
        src="/logo-icon.png"
        alt=""
        width={config.icon}
        height={config.icon}
        className="shrink-0"
        priority
      />
      {showText && (
        <span className={cn('text-foreground font-semibold', config.text)}>{t('appName')}</span>
      )}
    </Link>
  )
}
