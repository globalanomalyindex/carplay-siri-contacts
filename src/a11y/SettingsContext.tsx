import { createContext, useContext, type ReactNode } from 'react'
import type { AccessibilitySettings } from './useAccessibilitySettings'

const DEFAULTS: AccessibilitySettings = {
  forceReducedMotion: false,
  highContrast: false,
}

const SettingsContext = createContext<AccessibilitySettings>(DEFAULTS)

export function SettingsProvider({
  value,
  children,
}: {
  value: AccessibilitySettings
  children: ReactNode
}) {
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSettings(): AccessibilitySettings {
  return useContext(SettingsContext)
}
