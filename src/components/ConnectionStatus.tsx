import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'

type ConnState = 'connected' | 'reconnecting' | 'disconnected'

export default function ConnectionStatus() {
  const [state, setState] = useState<ConnState>('reconnecting')
  const disconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // A lightweight channel just for monitoring connection health.
    // Supabase Realtime calls back with 'SUBSCRIBED' on connect and
    // 'TIMED_OUT' / 'CLOSED' / 'CHANNEL_ERROR' on failure.
    const channel = supabase
      .channel('_conn_monitor')
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          if (disconnectTimerRef.current) {
            clearTimeout(disconnectTimerRef.current)
            disconnectTimerRef.current = null
          }
          setState('connected')
        } else {
          // Any non-SUBSCRIBED status = not connected
          setState((prev) => {
            if (prev === 'connected') {
              // Start 10s timer before showing hard-red disconnect
              disconnectTimerRef.current = setTimeout(() => {
                setState('disconnected')
              }, 10_000)
              return 'reconnecting'
            }
            return prev
          })
        }
      })

    return () => {
      supabase.removeChannel(channel)
      if (disconnectTimerRef.current) clearTimeout(disconnectTimerRef.current)
    }
  }, [])

  return (
    <>
      {/* Dot — top-right corner, always visible */}
      <div className="fixed top-3 right-3 z-50">
        {state === 'connected' && (
          <span
            className="block w-2.5 h-2.5 rounded-full bg-green-500"
            title="Connected"
          />
        )}
        {state === 'reconnecting' && (
          <span
            className="block w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse"
            title="Reconnecting…"
          />
        )}
        {state === 'disconnected' && (
          <span
            className="block w-2.5 h-2.5 rounded-full bg-red-500"
            title="Disconnected"
          />
        )}
      </div>

      {/* Toast — bottom of screen, non-blocking */}
      {state !== 'connected' && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          <div className="bg-gray-900 border border-gray-700 text-gray-300 text-xs font-medium px-4 py-2 rounded-full shadow-lg">
            {state === 'reconnecting'
              ? 'Connection lost — reconnecting…'
              : 'Disconnected — check your internet connection'}
          </div>
        </div>
      )}
    </>
  )
}
