import { useEffect, useState } from 'react'
import { useMagnifierInternal } from '../prototype/Magnifier'

export function useAriaLabelMap(intervalMs = 200): Record<string, string> {
  const { getTargets } = useMagnifierInternal()
  const [map, setMap] = useState<Record<string, string>>({})

  useEffect(() => {
    function snapshot() {
      const next: Record<string, string> = {}
      for (const [id, t] of getTargets()) {
        if (t.label) next[id] = t.label
      }
      setMap(next)
    }
    snapshot()
    const t = window.setInterval(snapshot, intervalMs)
    return () => window.clearInterval(t)
  }, [getTargets, intervalMs])

  return map
}
