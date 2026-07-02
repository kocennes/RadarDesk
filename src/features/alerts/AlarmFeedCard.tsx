import { Badge, Card, CardHeader, Text } from '@fluentui/react-components'
import { ListState } from '../../components/ui/ListState'
import type { Alert, Device, Incident } from '../../types/domain'
import { formatDisplayTime } from '../../utils/formatters'
import { buildAlarmFeedItems } from './alarmFeed'

type AlarmFeedCardProps = {
  alerts: Alert[]
  devices: Device[]
  incidents: Incident[]
}

const severityLabel = {
  critical: 'CRITICAL',
  high: 'HIGH',
  low: 'LOW',
  medium: 'MED',
  status: 'STATUS',
} as const

export function AlarmFeedCard({ alerts, devices, incidents }: AlarmFeedCardProps) {
  const feedItems = buildAlarmFeedItems({ alerts, devices, incidents })

  return (
    <Card className="alarm-feed-card">
      <CardHeader
        header={<Text weight="semibold">Alarm feed</Text>}
        description={<Text size={200}>Alarm, incident ve cihaz durum kronolojisi</Text>}
      />
      <div className="alarm-feed-list">
        {feedItems.length === 0 ? (
          <ListState message="Feed icin kayit yok" />
        ) : (
          feedItems.map((item) => (
            <article
              className={`alarm-feed-item alarm-feed-${item.severity} ${
                item.compact ? 'alarm-feed-item-compact' : ''
              }`}
              key={item.id}
            >
              <div className="alarm-feed-time">
                <Text size={200}>{formatDisplayTime(item.timestamp)}</Text>
              </div>
              <div className="alarm-feed-content">
                <div className="alarm-feed-heading">
                  <Text weight={item.compact ? 'regular' : 'semibold'}>{item.title}</Text>
                  <Badge appearance={item.compact ? 'outline' : 'filled'}>{severityLabel[item.severity]}</Badge>
                </div>
                <Text block className="muted" size={200}>
                  {item.subtitle}
                </Text>
                <div className="hud-chip-row">
                  <span className="hud-chip">TYPE: {item.kind.toUpperCase()}</span>
                  <span className="hud-chip">STATUS: {item.statusLabel}</span>
                  {item.actionText ? <span className="hud-chip hud-chip-action">{item.actionText}</span> : null}
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </Card>
  )
}
