import { cn } from '@/src/shared/lib/utils/cn'

interface VitaLoaderProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  icon?: React.ReactNode
  className?: string
}

const sizeMap = {
  sm: { icon: 'h-8 w-8', text: 'text-lg', gap: 'gap-2' },
  md: { icon: 'h-12 w-12', text: 'text-2xl', gap: 'gap-3' },
  lg: { icon: 'h-16 w-16', text: 'text-3xl', gap: 'gap-4' },
}

export function VitaLoader({ size = 'md', showText = true, icon, className }: VitaLoaderProps) {
  const s = sizeMap[size]

  return (
    <div
      role="status"
      className={cn('flex flex-col items-center justify-center', s.gap, className)}
    >
      {/* eslint-disable-next-line react/jsx-no-literals */}
      <span className="sr-only">Loading</span>
      {icon ? (
        <div className={cn(s.icon, 'animate-vita-heartbeat')}>{icon}</div>
      ) : (
        <div className={cn(s.icon, 'rounded-lg bg-primary animate-vita-heartbeat')} />
      )}
      {showText && (
        // eslint-disable-next-line react/jsx-no-literals
        <span className={cn(s.text, 'font-bold tracking-tight text-primary animate-vita-pulse')}>
          VITA
        </span>
      )}
    </div>
  )
}
