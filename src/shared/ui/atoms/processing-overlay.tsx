'use client'

import { useCallback, useEffect, useReducer, useRef } from 'react'
import { CalendarPlus, Check } from 'lucide-react'

import { cn } from '@/src/shared/lib/utils/cn'
import { Progress } from '@/src/shared/ui/progress'

interface ProcessingOverlayProps {
  isActive: boolean
  icon?: React.ReactNode
  title: string
  messages: string[]
  messageCycleMs?: number
  isComplete?: boolean
  onComplete?: () => void
  className?: string
}

const PROGRESS_STAGES = [
  { target: 15, durationMs: 600 },
  { target: 35, durationMs: 1400 },
  { target: 52, durationMs: 2200 },
  { target: 68, durationMs: 3000 },
  { target: 78, durationMs: 4000 },
  { target: 85, durationMs: 5500 },
  { target: 89, durationMs: 8000 },
  { target: 92, durationMs: 12000 },
]

type OverlayState = {
  progress: number
  messageIndex: number
  visible: boolean
  exiting: boolean
}

type OverlayAction =
  | { type: 'ACTIVATE' }
  | { type: 'START_EXIT' }
  | { type: 'FINISH_EXIT' }
  | { type: 'SET_PROGRESS'; value: number }
  | { type: 'NEXT_MESSAGE'; total: number }
  | { type: 'COMPLETE' }

const INITIAL_STATE: OverlayState = { progress: 0, messageIndex: 0, visible: false, exiting: false }

function overlayReducer(state: OverlayState, action: OverlayAction): OverlayState {
  switch (action.type) {
    case 'ACTIVATE':
      return { progress: 0, messageIndex: 0, visible: true, exiting: false }
    case 'START_EXIT':
      return { ...state, exiting: true }
    case 'FINISH_EXIT':
      return INITIAL_STATE
    case 'SET_PROGRESS':
      return { ...state, progress: action.value }
    case 'NEXT_MESSAGE':
      return { ...state, messageIndex: (state.messageIndex + 1) % action.total }
    case 'COMPLETE':
      return { ...state, progress: 100 }
    default:
      return state
  }
}

export function ProcessingOverlay({
  isActive,
  icon,
  title,
  messages,
  messageCycleMs = 2500,
  isComplete = false,
  onComplete,
  className,
}: ProcessingOverlayProps) {
  const [state, dispatch] = useReducer(overlayReducer, INITIAL_STATE)
  const stageIndexRef = useRef(0)
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const clearAllTimeouts = useCallback(() => {
    for (const id of timeoutsRef.current) clearTimeout(id)
    timeoutsRef.current = []
  }, [])

  useEffect(() => {
    if (!isActive) return
    dispatch({ type: 'ACTIVATE' })
    stageIndexRef.current = 0
  }, [isActive])

  useEffect(() => {
    if (isActive || !state.visible) return
    dispatch({ type: 'START_EXIT' })
  }, [isActive, state.visible])

  useEffect(() => {
    if (!state.exiting) return
    const id = setTimeout(() => {
      dispatch({ type: 'FINISH_EXIT' })
      stageIndexRef.current = 0
    }, 400)
    timeoutsRef.current.push(id)
    return () => clearTimeout(id)
  }, [state.exiting])

  useEffect(() => {
    if (!isActive || isComplete) return

    clearAllTimeouts()

    for (const stage of PROGRESS_STAGES) {
      const id = setTimeout(() => {
        dispatch({ type: 'SET_PROGRESS', value: stage.target })
      }, stage.durationMs)
      timeoutsRef.current.push(id)
    }

    return clearAllTimeouts
  }, [isActive, isComplete, clearAllTimeouts])

  useEffect(() => {
    if (!isActive || messages.length <= 1) return

    const interval = setInterval(() => {
      dispatch({ type: 'NEXT_MESSAGE', total: messages.length })
    }, messageCycleMs)

    return () => clearInterval(interval)
  }, [isActive, messages, messageCycleMs])

  useEffect(() => {
    if (!isComplete) return

    dispatch({ type: 'COMPLETE' })

    if (onComplete) {
      const id = setTimeout(onComplete, 1200)
      timeoutsRef.current.push(id)
    }
  }, [isComplete, onComplete])

  useEffect(() => clearAllTimeouts, [clearAllTimeouts])

  if (!state.visible) return null

  const defaultIcon = <CalendarPlus className="h-6 w-6" aria-hidden />
  const activeIcon = icon ?? defaultIcon

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'absolute inset-0 z-50 flex items-center justify-center overflow-hidden rounded-[inherit]',
        'bg-background/80 backdrop-blur-sm',
        state.exiting ? 'animate-out fade-out duration-300' : 'animate-in fade-in duration-300',
        className
      )}
    >
      <div
        className={cn(
          'flex w-full max-w-xs flex-col items-center gap-5 px-4',
          state.exiting
            ? 'animate-out fade-out zoom-out-95 duration-300'
            : 'animate-in fade-in zoom-in-95 duration-400'
        )}
      >
        <div className="relative flex items-center justify-center">
          <div
            className={cn(
              'absolute h-16 w-16 rounded-full',
              'border-2 border-primary/20',
              isComplete
                ? 'scale-110 opacity-0 transition-all duration-500'
                : 'animate-[processing-orbit_3s_linear_infinite]'
            )}
          >
            <span
              className="bg-primary absolute -top-[3px] left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full"
              aria-hidden
            />
          </div>

          <div
            className={cn(
              'relative flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-500',
              isComplete
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                : 'bg-primary/10 text-primary animate-vita-pulse'
            )}
          >
            {isComplete ? <Check className="h-6 w-6" aria-hidden /> : activeIcon}
          </div>
        </div>

        <div className="flex w-full flex-col items-center gap-3">
          <p className="text-foreground text-sm font-semibold tracking-tight">{title}</p>

          <div className="w-full">
            <Progress
              value={state.progress}
              className={cn(
                'h-1.5 transition-all duration-700',
                isComplete && 'bg-emerald-500/20 [&_[data-slot=progress-indicator]]:bg-emerald-500'
              )}
            />
          </div>

          <div className="relative h-5 w-full overflow-hidden">
            <p
              key={state.messageIndex}
              className={cn(
                'text-muted-foreground absolute inset-x-0 text-center text-xs',
                'animate-in fade-in slide-in-from-bottom-1 duration-300'
              )}
            >
              {messages[state.messageIndex]}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
