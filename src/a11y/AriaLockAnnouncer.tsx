import { useMagnifierContext } from '../prototype/Magnifier'

export interface AriaLockAnnouncerProps {
  labels: Record<string, string>
}

export function AriaLockAnnouncer({ labels }: AriaLockAnnouncerProps) {
  const { lockedId } = useMagnifierContext()
  const text = lockedId ? labels[lockedId] ?? lockedId : ''

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      style={{
        position: 'absolute',
        width: 1,
        height: 1,
        margin: -1,
        padding: 0,
        clip: 'rect(0 0 0 0)',
        overflow: 'hidden',
        border: 0,
      }}
    >
      {text}
    </div>
  )
}
