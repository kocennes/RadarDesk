import type { Alert, Device } from '../../types/domain'

export type DashboardStats = {
  totalDevices: number
  onlineDevices: number
  activeAlerts: number
  criticalAlerts: number
}

export function getDashboardStats(devices: Device[], alerts: Alert[]): DashboardStats {
  return {
    totalDevices: devices.length,
    onlineDevices: devices.filter((device) => device.status === 'online').length,
    activeAlerts: alerts.length,
    criticalAlerts: alerts.filter((alert) => alert.severity === 'critical').length,
  }
}
