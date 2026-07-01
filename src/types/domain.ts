export type DeviceStatus = 'online' | 'offline' | 'warning' | 'alarm'

export type DeviceType = 'radar' | 'rf' | 'eo-ir' | 'c2'

export type Device = {
  id: string
  name: string
  type: DeviceType
  status: DeviceStatus
  location: string
  latitude: number
  longitude: number
  rangeKm: number
  lastSeen: string
}

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical'

export type Alert = {
  id: string
  title: string
  severity: AlertSeverity
  sourceDeviceId: string
  area: string
  timestamp: string
}

export type Project = {
  id: string
  name: string
  customer: string
  site: string
  status: 'draft' | 'survey' | 'active'
}
