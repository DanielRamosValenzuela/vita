'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { CheckCircle2, Loader2 } from 'lucide-react'

import { Progress } from '@/src/shared/ui/progress'

interface PayrollProgressBarProps {
  progressKey: string | null
  onComplete?: () => void
}

export function PayrollProgressBar({ progressKey, onComplete }: PayrollProgressBarProps) {
  const t = useTranslations('payroll')
  const [current, setCurrent] = useState(0)
  const [total, setTotal] = useState(0)
  const [status, setStatus] = useState<string>('idle')
  const onCompleteRef = useRef(onComplete)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    if (!progressKey) return

    const eventSource = new EventSource(`/api/payroll-progress?key=${encodeURIComponent(progressKey)}`)

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        setCurrent(data.current)
        setTotal(data.total)
        setStatus(data.status)

        if (data.status === 'completed' || data.status === 'failed') {
          eventSource.close()
          if (data.status === 'completed') onCompleteRef.current?.()
        }
      } catch {}
    }

    eventSource.onerror = () => {
      eventSource.close()
    }

    return () => {
      eventSource.close()
    }
  }, [progressKey])

  if (!progressKey || status === 'idle') return null

  const percentage = total > 0 ? Math.round((current / total) * 100) : 0

  return (
    <div className="space-y-2 rounded-lg border p-4">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          {status === 'generating' ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : status === 'completed' ? (
            <CheckCircle2 className="h-4 w-4 text-green-600" aria-hidden />
          ) : null}
          <span>
            {status === 'generating'
              ? t('progress.generating', { current, total })
              : status === 'completed'
                ? t('progress.completed')
                : t('progress.failed')}
          </span>
        </div>
        <span className="text-muted-foreground">{percentage}%</span>
      </div>
      <Progress value={percentage} />
    </div>
  )
}
