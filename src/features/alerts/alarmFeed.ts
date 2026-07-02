import type { Alert, AlertSeverity, Device, Incident } from '../../types/domain'

export type AlarmFeedItemKind = 'alert' | 'incident' | 'device-status'

export type AlarmFeedItem = {
  id: string
  kind: AlarmFeedItemKind
  title: string
  subtitle: string
  timestamp: string
  sortTime: number
  severity: AlertSeverity | 'status'
  statusLabel: string
  actionText?: string
  compact: boolean
}

const severityRank: Record<AlertSeverity, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
}

export function buildAlarmFeedItems(input: {
  alerts: Alert[]
  devices: Device[]
  incidents: Incident[]
}): AlarmFeedItem[] {
  const deviceById = new Map(input.devices.map((device) => [device.id, device]))
  const alertItems = input.alerts.map((alert) => buildAlertFeedItem(alert, deviceById))
  const incidentItems = input.incidents.map((incident) => buildIncidentFeedItem(incident, deviceById))
  const deviceItems = input.devices.map(buildDeviceStatusFeedItem)

  return [...alertItems, ...incidentItems, ...deviceItems]
    .sort((first, second) => {
      if (second.sortTime !== first.sortTime) {
        return second.sortTime - first.sortTime
      }

      return getFeedSeverityRank(second.severity) - getFeedSeverityRank(first.severity)
    })
    .slice(0, 12)
}

function buildAlertFeedItem(alert: Alert, deviceById: Map<string, Device>): AlarmFeedItem {
  const device = deviceById.get(alert.sourceDeviceId)

  return {
    id: `alert-${alert.id}`,
    kind: 'alert',
    title: alert.title,
    subtitle: `${alert.area} / ${device?.name ?? alert.sourceDeviceId}`,
    timestamp: alert.timestamp,
    sortTime: parseFeedTime(alert.timestamp),
    severity: alert.severity,
    statusLabel: alert.severity.toUpperCase(),
    actionText: getAlertActionText(alert, device),
    compact: alert.severity === 'low',
  }
}

function buildIncidentFeedItem(incident: Incident, deviceById: Map<string, Device>): AlarmFeedItem {
  const sourceDevices = incident.sourceDeviceIds
    .map((deviceId) => deviceById.get(deviceId))
    .filter((device): device is Device => Boolean(device))

  return {
    id: `incident-${incident.id}`,
    kind: 'incident',
    title: incident.title,
    subtitle: `${incident.sensorEventIds.length} event / ${sourceDevices.length} cihaz / CONF ${Math.round(
      incident.confidence * 100,
    )}%`,
    timestamp: incident.updatedAt,
    sortTime: parseFeedTime(incident.updatedAt),
    severity: incident.severity,
    statusLabel: incident.status.toUpperCase(),
    actionText: getIncidentActionText(incident, sourceDevices),
    compact: incident.severity === 'low' && incident.status !== 'reviewing',
  }
}

function buildDeviceStatusFeedItem(device: Device): AlarmFeedItem {
  const isMinorStatus = device.status === 'online' || device.status === 'offline'

  return {
    id: `device-${device.id}`,
    kind: 'device-status',
    title: device.name,
    subtitle: `${device.type.toUpperCase()} / ${device.location}`,
    timestamp: device.lastSeen,
    sortTime: parseFeedTime(device.lastSeen),
    severity: device.status === 'alarm' ? 'high' : device.status === 'warning' ? 'medium' : 'status',
    statusLabel: device.status.toUpperCase(),
    actionText: device.status === 'alarm' ? 'Operator incelemesi bekliyor' : undefined,
    compact: isMinorStatus,
  }
}

function getAlertActionText(alert: Alert, device: Device | undefined): string | undefined {
  if (alert.severity !== 'critical' && alert.severity !== 'high') {
    return undefined
  }

  if (device?.type === 'eo-ir') {
    return 'Kamera dogrulamasi gerekli'
  }

  return 'Operator incelemesi bekliyor'
}

function getIncidentActionText(incident: Incident, sourceDevices: Device[]): string | undefined {
  if (incident.severity !== 'critical' && incident.severity !== 'high' && incident.status !== 'reviewing') {
    return undefined
  }

  const sourceTypes = new Set(sourceDevices.map((device) => device.type))

  if (sourceTypes.has('rf') && sourceTypes.has('radar')) {
    return 'RF sinyali radar track ile eslesti'
  }

  if (sourceTypes.has('eo-ir')) {
    return 'Kamera dogrulamasi gerekli'
  }

  return 'Operator incelemesi bekliyor'
}

function parseFeedTime(value: string): number {
  const parsedDate = Date.parse(value)

  if (!Number.isNaN(parsedDate)) {
    return parsedDate
  }

  const timeMatch = /^(\d{1,2}):(\d{2})$/.exec(value.trim())

  if (timeMatch) {
    return Number(timeMatch[1]) * 60 + Number(timeMatch[2])
  }

  return 0
}

function getFeedSeverityRank(severity: AlarmFeedItem['severity']): number {
  return severity === 'status' ? 0 : severityRank[severity]
}
