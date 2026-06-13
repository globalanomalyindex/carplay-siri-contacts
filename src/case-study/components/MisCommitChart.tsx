import type { ExperimentResults } from '../../prototype/Magnifier/experiment'
import { useReducedMotion } from '../../a11y/useReducedMotion'

export interface MisCommitChartProps {
  data: ExperimentResults
  scenarioId?: string
}

const TIER_ORDER = ['physiological', 'essential', 'parkinsonian'] as const

const SR_ONLY: React.CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0,0,0,0)',
  whiteSpace: 'nowrap',
  border: 0,
}

export function MisCommitChart({ data, scenarioId = 'tab-contest' }: MisCommitChartProps) {
  useReducedMotion() // honored: bars are static SVG, no animation either way

  const scenarioCells = data.cells.filter((c) => c.scenarioId === scenarioId)
  const cells = TIER_ORDER.map(
    (tid) => scenarioCells.find((c) => c.tierId === tid)!,
  ).filter(Boolean)

  // layout constants
  const W = 720
  const H = 360
  const PAD_LEFT = 56
  const PAD_RIGHT = 24
  const PAD_TOP = 40
  const PAD_BOT = 56
  const chartW = W - PAD_LEFT - PAD_RIGHT
  const chartH = H - PAD_TOP - PAD_BOT

  const groupCount = cells.length
  const groupW = chartW / groupCount
  const barW = Math.floor(groupW * 0.26)
  const gap = Math.floor(groupW * 0.06)

  // y scale: 0..1 maps to chartH..0
  const yOf = (v: number) => PAD_TOP + chartH * (1 - Math.min(1, Math.max(0, v)))

  // essential tier for aria label
  const essentialCell = cells.find((c) => c.tierId === 'essential')
  const essentialReduction = essentialCell
    ? (essentialCell.absoluteRiskReduction * 100).toFixed(1)
    : '?'
  const ariaLabel =
    `simulated mis-commit rate bar chart. essential tremor tier: region gating reduces mis-commit rate by ${essentialReduction} percentage points versus no gating.`

  // y axis tick values
  const yTicks = [0, 0.25, 0.5, 0.75, 1.0]

  const patternId = 'diagonal-ink'

  return (
    <figure className="cs-chart-figure">
      <p className="cs-chart-caption">
        {'simulated first-try mis-commit rate, region gating on vs off. '}
        {data.seedCount}
        {' seeds per condition, the same hit-test the live prototype runs.'}
      </p>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={ariaLabel}
        style={{ width: '100%', display: 'block' }}
      >
        <defs>
          <pattern
            id={patternId}
            patternUnits="userSpaceOnUse"
            width="6"
            height="6"
            patternTransform="rotate(45)"
          >
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="6"
              stroke="var(--cs-text)"
              strokeWidth="1"
            />
          </pattern>
        </defs>

        {/* y-axis ticks and grid lines */}
        {yTicks.map((tick) => {
          const y = yOf(tick)
          const pct = Math.round(tick * 100)
          return (
            <g key={tick}>
              <line
                x1={PAD_LEFT}
                y1={y}
                x2={PAD_LEFT + chartW}
                y2={y}
                stroke="var(--cs-text)"
                strokeWidth="0.5"
                strokeOpacity="0.18"
              />
              <text
                x={PAD_LEFT - 6}
                y={y + 4}
                textAnchor="end"
                fontFamily="var(--cs-font-mono)"
                fontSize="11"
                fill="var(--cs-text-2)"
              >
                {pct}%
              </text>
            </g>
          )
        })}

        {/* x-axis base line */}
        <line
          x1={PAD_LEFT}
          y1={PAD_TOP + chartH}
          x2={PAD_LEFT + chartW}
          y2={PAD_TOP + chartH}
          stroke="var(--cs-text)"
          strokeWidth="1"
        />

        {/* y-axis spine */}
        <line
          x1={PAD_LEFT}
          y1={PAD_TOP}
          x2={PAD_LEFT}
          y2={PAD_TOP + chartH}
          stroke="var(--cs-text)"
          strokeWidth="1"
        />

        {/* bar groups */}
        {cells.map((cell, i) => {
          const groupX = PAD_LEFT + i * groupW
          const centerX = groupX + groupW / 2

          // OFF bar (solid ink)
          const offX = centerX - barW - gap / 2
          const offYTop = yOf(cell.offRate)
          const offBarH = (PAD_TOP + chartH) - offYTop

          // ON bar (diagonal hatch)
          const onX = centerX + gap / 2
          const onYTop = yOf(cell.onRate)
          const onBarH = (PAD_TOP + chartH) - onYTop

          // Wilson CI whiskers: OFF
          const offCiTop = yOf(cell.offWilson.hi)
          const offCiBot = yOf(cell.offWilson.lo)
          const offBarCx = offX + barW / 2

          // Wilson CI whiskers: ON
          const onCiTop = yOf(cell.onWilson.hi)
          const onCiBot = yOf(cell.onWilson.lo)
          const onBarCx = onX + barW / 2

          return (
            <g key={cell.tierId}>
              {/* OFF bar */}
              {offBarH > 0 && (
                <rect
                  x={offX}
                  y={offYTop}
                  width={barW}
                  height={offBarH}
                  fill="var(--cs-text)"
                />
              )}
              {/* OFF Wilson CI whisker */}
              <line
                x1={offBarCx}
                y1={offCiTop}
                x2={offBarCx}
                y2={offCiBot}
                stroke="var(--cs-text)"
                strokeWidth="1"
              />
              <line
                x1={offBarCx - 4}
                y1={offCiTop}
                x2={offBarCx + 4}
                y2={offCiTop}
                stroke="var(--cs-text)"
                strokeWidth="1"
              />
              <line
                x1={offBarCx - 4}
                y1={offCiBot}
                x2={offBarCx + 4}
                y2={offCiBot}
                stroke="var(--cs-text)"
                strokeWidth="1"
              />

              {/* ON bar (hatched) */}
              {onBarH > 0 && (
                <rect
                  x={onX}
                  y={onYTop}
                  width={barW}
                  height={onBarH}
                  fill={`url(#${patternId})`}
                  stroke="var(--cs-text)"
                  strokeWidth="1"
                />
              )}
              {/* ON bar zero-rate marker (1px line at baseline so it's visible) */}
              {onBarH <= 0 && (
                <line
                  x1={onX}
                  y1={PAD_TOP + chartH - 1}
                  x2={onX + barW}
                  y2={PAD_TOP + chartH - 1}
                  stroke="var(--cs-text)"
                  strokeWidth="1"
                />
              )}
              {/* ON Wilson CI whisker */}
              <line
                x1={onBarCx}
                y1={onCiTop}
                x2={onBarCx}
                y2={onCiBot}
                stroke="var(--cs-text)"
                strokeWidth="1"
              />
              <line
                x1={onBarCx - 4}
                y1={onCiTop}
                x2={onBarCx + 4}
                y2={onCiTop}
                stroke="var(--cs-text)"
                strokeWidth="1"
              />
              <line
                x1={onBarCx - 4}
                y1={onCiBot}
                x2={onBarCx + 4}
                y2={onCiBot}
                stroke="var(--cs-text)"
                strokeWidth="1"
              />

              {/* tier label */}
              <text
                x={centerX}
                y={PAD_TOP + chartH + 18}
                textAnchor="middle"
                fontFamily="var(--cs-font-mono)"
                fontSize="11"
                fill="var(--cs-text-2)"
              >
                {cell.band}
              </text>
            </g>
          )
        })}

        {/* legend */}
        <rect
          x={PAD_LEFT}
          y={8}
          width={14}
          height={10}
          fill="var(--cs-text)"
        />
        <text
          x={PAD_LEFT + 18}
          y={17}
          fontFamily="var(--cs-font-mono)"
          fontSize="11"
          fill="var(--cs-text-2)"
        >
          gating off
        </text>
        <rect
          x={PAD_LEFT + 84}
          y={8}
          width={14}
          height={10}
          fill={`url(#${patternId})`}
          stroke="var(--cs-text)"
          strokeWidth="1"
        />
        <text
          x={PAD_LEFT + 102}
          y={17}
          fontFamily="var(--cs-font-mono)"
          fontSize="11"
          fill="var(--cs-text-2)"
        >
          gating on
        </text>
      </svg>

      {/* Screen-reader table */}
      <table style={SR_ONLY}>
        <caption>
          simulated first-try mis-commit rate by tremor tier, region gating on vs off
        </caption>
        <thead>
          <tr>
            <th scope="col">tremor tier</th>
            <th scope="col">gating off</th>
            <th scope="col">gating on</th>
            <th scope="col">absolute reduction</th>
          </tr>
        </thead>
        <tbody>
          {cells.map((cell) => (
            <tr key={cell.tierId}>
              <td>{cell.band}</td>
              <td>{(cell.offRate * 100).toFixed(1)}%</td>
              <td>{(cell.onRate * 100).toFixed(1)}%</td>
              <td>{(cell.absoluteRiskReduction * 100).toFixed(1)}pp</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}
