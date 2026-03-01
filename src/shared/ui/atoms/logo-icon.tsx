import { cn } from '@/src/shared/lib/utils'

interface LogoIconProps {
  className?: string
  animated?: boolean
  hoverAnimate?: boolean
}

export function LogoIcon({ className, animated = false, hoverAnimate = false }: LogoIconProps) {
  const lightBlue = '#4D7CF5'
  const darkBlue = '#1B2B5A'

  const animationBase = animated
    ? 'opacity-0 animate-[logo-block-in_0.4s_ease-out_forwards]'
    : hoverAnimate
      ? 'group-hover:animate-[logo-block-in_0.4s_ease-out_forwards]'
      : ''

  const delay = (i: number) => {
    if (animated) return { style: { animationDelay: `${i * 80}ms` } }
    if (hoverAnimate) return { style: { animationDelay: `${i * 80}ms` } }
    return {}
  }

  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0', className)}
      aria-hidden="true"
    >
      <path
        d="M8 28 C8 14, 18 4, 32 4 C18 4, 8 14, 8 28Z"
        fill={lightBlue}
        className={animationBase}
        {...delay(0)}
      />
      <path
        d="M4 30 Q4 4, 30 4 L4 4Z"
        fill={lightBlue}
        className={animationBase}
        {...delay(0)}
      />
      <path
        d="M34 4 Q50 4, 50 20 L34 20Z"
        fill={lightBlue}
        className={animationBase}
        {...delay(1)}
      />
      <path
        d="M34 4 L50 4 Q34 4, 34 20Z"
        fill="#6B93F7"
        className={animationBase}
        {...delay(1)}
      />
      <path
        d="M54 4 L72 4 L72 20 Q54 20, 54 4Z"
        fill={darkBlue}
        className={animationBase}
        {...delay(2)}
      />
      <rect
        x="72"
        y="4"
        width="24"
        height="16"
        rx="2"
        fill={darkBlue}
        className={animationBase}
        {...delay(3)}
      />
      <path
        d="M20 24 Q30 24, 30 34 L20 34Z"
        fill={lightBlue}
        className={animationBase}
        {...delay(2)}
      />
      <path
        d="M4 34 Q4 24, 14 24 L4 24Z"
        fill={darkBlue}
        className={animationBase}
        {...delay(3)}
      />
      <path
        d="M34 24 L50 24 L50 46 Q34 46, 34 24Z"
        fill={darkBlue}
        className={animationBase}
        {...delay(4)}
      />
      <path
        d="M54 24 L72 24 L72 46 L54 46Z"
        fill={darkBlue}
        className={animationBase}
        {...delay(4)}
      />
      <path
        d="M72 24 Q96 24, 96 48 L72 48Z"
        fill={lightBlue}
        className={animationBase}
        {...delay(5)}
      />
      <path
        d="M4 38 L30 38 L30 62 Q4 62, 4 38Z"
        fill={darkBlue}
        className={animationBase}
        {...delay(5)}
      />
      <path
        d="M34 50 Q50 50, 50 66 L34 66Z"
        fill={darkBlue}
        className={animationBase}
        {...delay(6)}
      />
      <rect
        x="54"
        y="50"
        width="18"
        height="16"
        rx="2"
        fill={lightBlue}
        className={animationBase}
        {...delay(7)}
      />
      <path
        d="M72 50 L96 50 L96 66 Q72 66, 72 50Z"
        fill={lightBlue}
        className={animationBase}
        {...delay(8)}
      />
    </svg>
  )
}
