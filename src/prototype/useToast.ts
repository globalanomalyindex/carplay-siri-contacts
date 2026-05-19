import { createContext, useContext } from 'react'

export interface ToastCtx {
  show: (message: string) => void
}

// Default is a no-op so unit tests can render Toast consumers without
// having to wrap every component in <ToastProvider>. Production wraps the
// real provider near the App root.
const NOOP: ToastCtx = { show: () => {} }

export const ToastContext = createContext<ToastCtx>(NOOP)

export function useToast(): ToastCtx {
  return useContext(ToastContext)
}
