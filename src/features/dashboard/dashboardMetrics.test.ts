import { describe, expect, it } from 'vitest'
import { alerts } from '../../mocks/alerts'
import { devices } from '../../mocks/devices'
import { getDashboardStats } from './dashboardMetrics'

describe('getDashboardStats', () => {
  it('calculates dashboard summary values from mock data', () => {
    expect(getDashboardStats(devices, alerts)).toEqual({
      totalDevices: 4,
      onlineDevices: 2,
      activeAlerts: 3,
      criticalAlerts: 1,
    })
  })
})
