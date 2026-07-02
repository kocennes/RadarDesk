import type { EffectiveAccess } from '../../types/domain'

export type DashboardModuleVisibility = {
  canUseDeviceSetup: boolean
  canUseSensorTester: boolean
  canViewAlerts: boolean
  canViewCameraFeeds: boolean
  canViewDevices: boolean
  canViewIncidents: boolean
  canViewMap: boolean
  canViewSensorEvents: boolean
}

export function getDashboardModuleVisibility(_effectiveAccess: EffectiveAccess): DashboardModuleVisibility {
  return {
    canUseDeviceSetup: true,
    canUseSensorTester: true,
    canViewAlerts: true,
    canViewCameraFeeds: true,
    canViewDevices: true,
    canViewIncidents: true,
    canViewMap: true,
    canViewSensorEvents: true,
  }
}
