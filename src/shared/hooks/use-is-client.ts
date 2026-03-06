'use client'

import { useSyncExternalStore } from 'react'

let isClient = false

function subscribe(callback: () => void) {
  if (typeof window === 'undefined') return () => {}
  if (isClient) {
    callback()
    return () => {}
  }
  const onReady = () => {
    isClient = true
    callback()
  }
  if (document.readyState === 'complete') queueMicrotask(onReady)
  else {
    window.addEventListener('load', onReady)
    return () => window.removeEventListener('load', onReady)
  }
  return () => {}
}

export function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => isClient,
    () => false
  )
}
