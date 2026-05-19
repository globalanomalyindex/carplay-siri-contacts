import { useRef, useState } from 'react'
import { MagnifiableFrame, useMagnifiable } from '../Magnifier'

const QUEUE = [
  { id: 'q1', title: 'Sunrise Drive', artist: 'Tycho' },
  { id: 'q2', title: 'A Walk',         artist: 'Tycho' },
  { id: 'q3', title: 'Awake',          artist: 'Tycho' },
  { id: 'q4', title: 'Spectre',        artist: 'Tycho' },
]

export function MusicSketch() {
  const [progress, setProgress] = useState(0.34)
  return (
    <div className="h-full p-3 flex flex-col gap-3">
      <NowPlaying progress={progress} setProgress={setProgress} />
      <div className="flex-1 overflow-y-auto flex flex-col gap-1">
        <div style={{ fontSize: 10, color: 'var(--text-tertiary)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Up Next</div>
        {QUEUE.map((t, i) => (
          <MagnifiableFrame
            key={t.id}
            id={`queue-${t.id}`}
            index={i}
            onCommit={() => alert(`Playing ${t.title}`)}
            label={`Play ${t.title} by ${t.artist}`}
          >
            <div
              data-testid={`queue-row-${t.id}`}
              style={{
                padding: '6px 10px',
                color: 'rgba(255,255,255,0.85)',
                fontSize: 13,
                background: 'rgba(255,255,255,0.05)',
                borderRadius: 6,
                display: 'flex',
                gap: 10,
                alignItems: 'center',
              }}
            >
              <div style={{ width: 24, height: 24, borderRadius: 4, background: 'linear-gradient(135deg, #b8a3c4, #7fa3c4)' }} />
              <div>
                <div>{t.title}</div>
                <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{t.artist}</div>
              </div>
            </div>
          </MagnifiableFrame>
        ))}
      </div>
    </div>
  )
}

function NowPlaying({ progress, setProgress }: { progress: number; setProgress: (n: number) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div data-testid="now-playing-title" style={{ color: 'var(--text-primary)', fontSize: 15, fontWeight: 600 }}>
        I Can't Let You Go In This Life
      </div>
      <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Love Spells</div>
      <ProgressBar progress={progress} setProgress={setProgress} />
    </div>
  )
}

function ProgressBar({ progress, setProgress }: { progress: number; setProgress: (n: number) => void }) {
  const ref = useRef<HTMLDivElement>(null)

  useMagnifiable({
    id: 'music-progress',
    ref,
    behavior: 'freeDrift',
    onCommit: (p) => {
      const rect = ref.current!.getBoundingClientRect()
      const t = Math.max(0, Math.min(1, ((p?.x ?? rect.left) - rect.left) / rect.width))
      setProgress(t)
    },
    label: 'Scrub progress',
  })

  return (
    <div
      ref={ref}
      data-testid="progress-bar"
      style={{
        position: 'relative',
        height: 6,
        background: 'rgba(255,255,255,0.10)',
        borderRadius: 3,
        cursor: 'pointer',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 0, top: 0, bottom: 0,
          width: `${progress * 100}%`,
          background: 'rgba(180,230,250,0.85)',
          borderRadius: 3,
        }}
      />
    </div>
  )
}
