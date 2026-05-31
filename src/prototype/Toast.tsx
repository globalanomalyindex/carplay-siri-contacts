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
        data-variant="toast"
        data-state={message ? 'visible' : 'hidden'}
        style={{
          // Anchored to the device frame (the nearest positioned ancestor)
          // rather than the viewport, so the confirmation reads as part of the
          // screen and never collides with the surrounding page chrome.
          position: 'absolute',
          bottom: 10,
          left: '50%',
          background: 'rgba(20, 30, 40, 0.72)',
          color: 'white',
          padding: '10px 18px',
          borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.10)',
          fontSize: 13,
          fontWeight: 500,
          letterSpacing: '-0.01em',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          boxShadow:
            '0 1px 3px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.18)',
          zIndex: 300,
          opacity: message ? 1 : 0,
          // Rise into place and settle back down on dismiss: the toast always
          // enters and exits from the same direction, so it reads as one object.
          transform: message ? 'translate(-50%, 0)' : 'translate(-50%, 8px)',
          pointerEvents: message ? 'auto' : 'none',
          transition: 'opacity 0.22s ease, transform 0.22s cubic-bezier(0.08, 0.82, 0.17, 1)',
        }}
      >
        {message ?? ''}
      </div>
    </ToastContext.Provider>
  )
}
