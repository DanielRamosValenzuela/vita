import Image from 'next/image'

import { cn } from '@/src/shared/lib/utils/cn'

interface VitaLoaderProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

const sizeMap = {
  sm: { icon: 32, text: 'text-lg', gap: 'gap-2' },
  md: { icon: 48, text: 'text-2xl', gap: 'gap-3' },
  lg: { icon: 64, text: 'text-3xl', gap: 'gap-4' },
}

export function VitaLoader({ size = 'md', showText = true, className }: VitaLoaderProps) {
  const s = sizeMap[size]

  return (
    <div
      role="status"
      className={cn('flex flex-col items-center justify-center', s.gap, className)}
    >
      {/* eslint-disable-next-line react/jsx-no-literals */}
      <span className="sr-only">Loading</span>
      <div className="animate-logo-shimmer">
        <Image
          src="/logo-icon.png"
          alt=""
          width={s.icon}
          height={s.icon}
          priority
        />
      </div>
      {showText && (
        // eslint-disable-next-line react/jsx-no-literals
        <span className={cn(s.text, 'font-bold tracking-tight text-primary animate-vita-pulse')}>
          VITA
        </span>
      )}
    </div>
  )
}
