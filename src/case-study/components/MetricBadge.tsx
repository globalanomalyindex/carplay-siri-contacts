export interface MetricBadgeProps {
  kind: 'measured' | 'projected' | 'estimate'
}

const LABELS: Record<MetricBadgeProps['kind'], string> = {
  measured:  'measured',
  projected: 'projected',
  estimate:  'estimate',
}

export function MetricBadge({ kind }: MetricBadgeProps) {
  return (
    <span className={`cs-badge cs-badge-${kind}`}>
      {LABELS[kind]}
    </span>
  )
}
