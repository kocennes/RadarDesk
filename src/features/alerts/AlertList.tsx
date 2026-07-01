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

export type AlertListProps = {
  alerts: Alert[]
  severityFilter: AlertSeverityFilter
  viewMode: DashboardViewMode
  onSeverityFilterChange: (severity: AlertSeverityFilter) => void
}

export function AlertList({ alerts, onSeverityFilterChange, severityFilter, viewMode }: AlertListProps) {
  if (viewMode === 'loading') {
    return <ListState message="Loading alerts" />
  }

  if (viewMode === 'error') {
    return <ListState message="Alerts could not be loaded" tone="error" />
  }

  if (viewMode === 'empty') {
    return <ListState message="No alerts in this demo state" />
  }

  function handleSeverityFilterChange(event: ChangeEvent<HTMLSelectElement>) {
    onSeverityFilterChange(event.target.value as AlertSeverityFilter)
  }

  return (
    <div className="stack">
      <div className="panel-filters panel-filters-single">
        <Field label="Severity" size="small">
          <Select aria-label="Filter alerts by severity" value={severityFilter} onChange={handleSeverityFilterChange}>
            <option value="all">All</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </Select>
        </Field>
      </div>

      {alerts.length === 0 ? (
        <ListState message="No alerts match this severity" />
      ) : (
        alerts.map((alert) => (
          <div className="alert-row" key={alert.id}>
            <div>
              <Text weight="semibold">{alert.title}</Text>
              <Text className="muted" size={200}>
                {alert.area} / {formatDisplayTime(alert.timestamp)}
              </Text>
            </div>
            <Badge color={alertSeverityColor[alert.severity]}>{alert.severity}</Badge>
          </div>
        ))
      )}
    </div>
  )
}
