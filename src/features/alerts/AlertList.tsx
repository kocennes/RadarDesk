import { Badge, Field, Select, Text } from '@fluentui/react-components'
import type { ChangeEvent } from 'react'
import type { Alert, AlertSeverity } from '../../types/domain'
import { ListState } from '../../components/ui/ListState'
import { formatDisplayTime } from '../../utils/formatters'
import type { DashboardViewMode } from '../dashboard/dashboardViewState'
import type { AlertSeverityFilter } from './alertFilters'

const alertSeverityColor: Record<AlertSeverity, 'informative' | 'warning' | 'danger' | 'important'> = {
  low: 'informative',
  medium: 'warning',
  high: 'danger',
  critical: 'important',
}

const alertSeverityLabel: Record<AlertSeverityFilter, string> = {
  all: 'Tumu',
  low: 'Dusuk',
  medium: 'Orta',
  high: 'Yuksek',
  critical: 'Kritik',
}

export type AlertListProps = {
  alerts: Alert[]
  severityFilter: AlertSeverityFilter
  viewMode: DashboardViewMode
  onSeverityFilterChange: (severity: AlertSeverityFilter) => void
}

export function AlertList({ alerts, onSeverityFilterChange, severityFilter, viewMode }: AlertListProps) {
  if (viewMode === 'loading') {
    return <ListState message="Alarmlar yukleniyor" />
  }

  if (viewMode === 'error') {
    return <ListState message="Alarmlar yuklenemedi" tone="error" />
  }

  if (viewMode === 'empty') {
    return <ListState message="Bu UI durumunda alarm yok" />
  }

  function handleSeverityFilterChange(event: ChangeEvent<HTMLSelectElement>) {
    onSeverityFilterChange(event.target.value as AlertSeverityFilter)
  }

  return (
    <div className="stack">
      <div className="panel-filters panel-filters-single">
        <Field label="Seviye" size="small">
          <Select aria-label="Alarmlari seviye ile filtrele" value={severityFilter} onChange={handleSeverityFilterChange}>
            <option value="all">{alertSeverityLabel.all}</option>
            <option value="low">{alertSeverityLabel.low}</option>
            <option value="medium">{alertSeverityLabel.medium}</option>
            <option value="high">{alertSeverityLabel.high}</option>
            <option value="critical">{alertSeverityLabel.critical}</option>
          </Select>
        </Field>
      </div>

      {alerts.length === 0 ? (
        <ListState message="Bu seviyeye uyan alarm yok" />
      ) : (
        alerts.map((alert) => (
          <div className={`alert-row alert-severity-${alert.severity}`} key={alert.id}>
            <div>
              <Text weight="semibold">{alert.title}</Text>
              <Text className="muted" size={200}>
                {alert.area} / {formatDisplayTime(alert.timestamp)}
              </Text>
            </div>
            <Badge color={alertSeverityColor[alert.severity]}>{alertSeverityLabel[alert.severity]}</Badge>
          </div>
        ))
      )}
    </div>
  )
}
