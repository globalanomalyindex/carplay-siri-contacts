import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { ToastContext } from './useToast'

/**
 * Non-blocking notification that floats above the UI for two seconds.
 * Used to confirm actions in the prototype without the modal stall of
 * window.alert().
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null)

  const show = useCallback((m: string) => {
    setMessage(m)
  }, [])

  useEffect(() => {
    if (!message) return
    const t = window.setTimeout(() => setMessage(null), 2000)
    return () => window.clearTimeout(t)
  }, [message])

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div
        role="status"
        aria-live="polite"
        style={{
          position: 'fixed',
          bottom: 32,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(20, 30, 40, 0.92)',
          color: 'white',
          padding: '10px 18px',
          borderRadius: 10,
          border: '1px solid rgba(255,255,255,0.10)',
          fontSize: 13,
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          zIndex: 300,
          opacity: message ? 1 : 0,
          pointerEvents: message ? 'auto' : 'none',
          transition: 'opacity 0.2s ease',
        }}
      >
        {message ?? ''}
      </div>
    </ToastContext.Provider>
  )
}
