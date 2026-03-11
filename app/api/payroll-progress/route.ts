import { NextRequest } from 'next/server'

import { getProgress } from '@/src/shared/lib/payment/payroll-progress'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get('key')
  if (!key) return new Response('Missing key', { status: 400 })

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      let closed = false

      const send = (data: Record<string, unknown>) => {
        if (closed) return
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      const interval = setInterval(() => {
        const progress = getProgress(key)
        if (!progress) {
          send({ current: 0, total: 0, status: 'idle' })
          return
        }

        send({
          current: progress.current,
          total: progress.total,
          status: progress.status,
        })

        if (progress.status === 'completed' || progress.status === 'failed') {
          closed = true
          clearInterval(interval)
          controller.close()
        }
      }, 1000)

      req.signal.addEventListener('abort', () => {
        closed = true
        clearInterval(interval)
        try {
          controller.close()
        } catch {}
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}
