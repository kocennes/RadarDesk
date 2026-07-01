import { Card, Text } from '@fluentui/react-components'

export type MetricTone = 'neutral' | 'success' | 'warning' | 'danger'

export type MetricCardProps = {
  label: string
  value: number
  tone: MetricTone
}

export function MetricCard({ label, value, tone }: MetricCardProps) {
  return (
    <Card className={`metric-card metric-${tone}`}>
      <Text className="muted" size={200}>
        {label}
      </Text>
      <Text size={700} weight="semibold">
        {value}
      </Text>
    </Card>
  )
}
