import type { Alert, AlertSeverity } from '../../types/domain'

export type AlertSeverityFilter = AlertSeverity | 'all'

export function filterAlerts(alerts: Alert[], severity: AlertSeverityFilter): Alert[] {
  if (severity === 'all') {
    return alerts
  }

  return alerts.filter((alert) => alert.severity === severity)
}
