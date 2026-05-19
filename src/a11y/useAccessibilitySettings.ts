import { useState, useCallback, useEffect } from 'react'

/**
 * Prototype-level accessibility settings. In production these would live in
 * CarPlay's Accessibility settings; here they are toggleable via the debug UI.
 *
 * Long-press-anywhere is no longer a setting: it is on by default for every
 * user (the tap-rescue path) and lives directly in the orchestrating shell.
 */
export interface AccessibilitySettings {
  /** Manual override of the OS Reduce Motion setting (for testing). */
  forceReducedMotion: boolean
  /** Manual override for high-contrast mode (raises glass-frame opacity). */
  highContrast: boolean
}

const DEFAULTS: AccessibilitySettings = {
  forceReducedMotion: false,
  highContrast: false,
}

const STORAGE_KEY = 'oma:a11y-settings'

export function useAccessibilitySettings() {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    if (typeof window === 'undefined') return DEFAULTS
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS
    } catch {
      return DEFAULTS
    }
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch {
      /* ignore quota errors */
    }
  }, [settings])

  const update = useCallback(<K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K],
  ) => {
    setSettings((s) => ({ ...s, [key]: value }))
  }, [])

  return { settings, update }
}
