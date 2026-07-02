import { Badge, Card, CardHeader, Text } from '@fluentui/react-components'
import { ListState } from '../../components/ui/ListState'
import type { AlertSeverity, SensorEvent, SensorEventKind } from '../../types/domain'
import { formatDisplayTime } from '../../utils/formatters'

type SensorEventListProps = {
  events: SensorEvent[]
}

const severityColor: Record<AlertSeverity, 'success' | 'warning' | 'danger' | 'subtle'> = {
  critical: 'danger',
  high: 'danger',
  low: 'subtle',
  medium: 'warning',
}

const kindLabel: Record<SensorEventKind, string> = {
  'camera-motion': 'Kamera hareket',
  'camera-object': 'Kamera nesne',
  'device-state': 'Cihaz durumu',
  'radar-track': 'Radar track',
  'radar-zone': 'Radar bolge',
  'rf-frequency': 'RF frekans',
  'rf-signal': 'RF sinyal',
  'thermal-motion': 'Termal hareket',
}

export function SensorEventList({ events }: SensorEventListProps) {
  return (
    <Card>
      <CardHeader
        header={<Text weight="semibold">Yerel olaylar</Text>}
        description={<Text size={200}>Backend tarafinda normalize edilen sensor olaylari</Text>}
      />
      <div className="stack">
        {events.length === 0 ? (
          <ListState message="Henuz sensor olayi yok" />
        ) : (
          events.map((event) => (
            <article className="event-row" key={event.id}>
              <div>
                <Text weight="semibold">{kindLabel[event.kind]}</Text>
                <Text block className="muted" size={200}>
                  {event.deviceId} / {formatDisplayTime(event.detectedAt)}
                </Text>
                {event.evidence?.snapshotPath ? (
                  <Text block className="muted" size={200}>
                    Kanit: {event.evidence.snapshotPath}
                  </Text>
                ) : null}
                {event.evidence?.dataPath ? (
                  <Text block className="muted" size={200}>
                    Veri kaydi: {event.evidence.dataPath}
                  </Text>
                ) : null}
              </div>
              <Badge color={severityColor[event.severity]}>{event.severity}</Badge>
            </article>
          ))
        )}
      </div>
    </Card>
  )
}
