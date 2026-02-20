import { cn } from '@/src/shared/lib/utils/cn'

interface AnimateInProps {
  delay?: 0 | 75 | 100 | 150 | 200 | 300 | 500
  className?: string
  children: React.ReactNode
}

const delayMap: Record<number, string> = {
  0: '',
  75: 'delay-75',
  100: 'delay-100',
  150: 'delay-150',
  200: 'delay-200',
  300: 'delay-300',
  500: 'delay-500',
}

export function AnimateIn({ delay = 0, className, children }: AnimateInProps) {
  return (
    <div
      className={cn(
        'animate-in fade-in slide-in-from-bottom-2 duration-400 fill-mode-both',
        delayMap[delay],
        className,
      )}
    >
      {children}
    </div>
  )
}
