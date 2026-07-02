import { describe, expect, it } from 'vitest'
import type { EffectiveAccess } from '../../types/domain'
import { getDashboardModuleVisibility } from './moduleVisibility'

const baseAccess: EffectiveAccess = {
  allowedDeviceTypes: [],
  allowedModules: [],
  customerIds: [],
  packageIds: [],
  projectIds: [],
  role: 'viewer',
  userId: 'user-test',
}

describe('getDashboardModuleVisibility', () => {
  it('enables every local operational panel from the first product experience', () => {
    const visibility = getDashboardModuleVisibility({
      ...baseAccess,
      allowedModules: [],
    })

    expect(visibility).toEqual({
      canUseDeviceSetup: true,
      canUseSensorTester: true,
      canViewAlerts: true,
      canViewCameraFeeds: true,
      canViewDevices: true,
      canViewIncidents: true,
      canViewMap: true,
      canViewSensorEvents: true,
    })
  })

  it('keeps package access data available without using it as a local frontend barrier', () => {
    const visibility = getDashboardModuleVisibility({
      ...baseAccess,
      allowedModules: ['dashboard'],
    })

    expect(visibility).toEqual({
      canUseDeviceSetup: true,
      canUseSensorTester: true,
      canViewAlerts: true,
      canViewCameraFeeds: true,
      canViewDevices: true,
      canViewIncidents: true,
      canViewMap: true,
      canViewSensorEvents: true,
    })
  })
})
