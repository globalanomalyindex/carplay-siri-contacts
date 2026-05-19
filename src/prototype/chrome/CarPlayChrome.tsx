import type { ReactNode } from 'react'

export interface CarPlayChromeProps {
  /** The orb's home position: a 46pt liquid-glass frame, top-left, above the dock. */
  orbHome: ReactNode
  /** The CarPlay system dock: Maps / Music / Phone / Settings icons. */
  dock: ReactNode
  /** The foreground app's content area. */
  children: ReactNode
  /** Optional status-bar override (defaults to "11:45 · 5G"). */
  statusBar?: ReactNode
}

/**
 * The CarPlay system chrome. A fixed frame around the foreground app content.
 * Structure: status bar across the top, left column (orb home + dock), right
 * column (app content). All layout values come from spec section 4.1 and tokens.
 */
export function CarPlayChrome({
  orbHome,
  dock,
  children,
  statusBar,
}: CarPlayChromeProps) {
  return (
    <div
      data-variant="carplay-chrome"
      className="relative w-full h-full overflow-hidden"
      style={{
        // 20px reads more iOS than Tailwind's rounded-2xl (16px) at this
        // surface size, while keeping inner cards visually subordinate at
        // 12px.
        borderRadius: 20,
        background: `linear-gradient(135deg, var(--carplay-bg-from) 0%, var(--carplay-bg-mid) 60%, var(--carplay-bg-to) 100%)`,
        boxShadow:
          '0 1px 3px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.20)',
      }}
    >
      {/* Status bar */}
      <div
        data-testid="carplay-status-bar"
        className="absolute top-0 left-0 right-0 flex items-center px-3 text-[10px]"
        style={{ height: 22, color: 'var(--text-secondary)' }}
      >
        {statusBar ?? <span>11:45 · 5G</span>}
      </div>

      {/* Body: left column + app content */}
      <div className="flex h-full pt-[22px]">
        <div
          data-testid="carplay-left-col"
          className="flex flex-col items-center gap-1.5 py-2"
          style={{
            width: 'var(--dock-width)',
            background: 'var(--carplay-dock-bg)',
          }}
        >
          {/* Orb home above dock, separator between */}
          <div className="mb-1">{orbHome}</div>
          <div
            className="w-7 h-px"
            style={{ background: 'rgba(255,255,255,0.15)' }}
          />
          <div>{dock}</div>
        </div>

        <div
          data-testid="carplay-app-content"
          className="flex-1 relative"
          style={{ minWidth: 0, minHeight: 0 }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
