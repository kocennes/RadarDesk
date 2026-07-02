import { describe, expect, it } from 'vitest'
import { getAccessScopedDashboardData, getEffectiveAccess, getProductPackages } from './accessControl'

describe('accessControl', () => {
  it('defines package device and module permissions explicitly', () => {
    const cameraPackage = getProductPackages().find((productPackage) => productPackage.id === 'camera-thermal')
    const fullOpsPackage = getProductPackages().find((productPackage) => productPackage.id === 'full-ops')

    expect(cameraPackage?.allowedDeviceTypes).toEqual(['eo-ir'])
    expect(cameraPackage?.allowedModules).toEqual(
      expect.arrayContaining(['dashboard', 'devices', 'alerts', 'map', 'camera-feeds']),
    )
    expect(fullOpsPackage?.allowedDeviceTypes).toEqual(expect.arrayContaining(['radar', 'rf', 'eo-ir', 'c2']))
    expect(fullOpsPackage?.allowedModules).toContain('c2')
  })

  it('computes effective access from group memberships', () => {
    const effectiveAccess = getEffectiveAccess('user-viewer-001')

    expect(effectiveAccess).toMatchObject({
      userId: 'user-viewer-001',
      role: 'viewer',
      customerIds: ['customer-training'],
      projectIds: ['project-001'],
      packageIds: ['camera-thermal'],
      allowedDeviceTypes: ['eo-ir'],
    })
    expect(effectiveAccess.allowedModules).toContain('camera-feeds')
    expect(effectiveAccess.allowedModules).not.toContain('radar-ops')
  })

  it('filters dashboard data before it reaches the client', () => {
    const dashboardData = getAccessScopedDashboardData('user-viewer-001')

    expect(dashboardData.devices.map((device) => device.type)).toEqual(['eo-ir'])
    expect(dashboardData.alerts.map((alert) => alert.sourceDeviceId)).toEqual(['eo-003'])
    expect(dashboardData.cameraFeeds).toHaveLength(2)
    expect(dashboardData.projects.map((project) => project.id)).toEqual(['project-001'])
  })

  it('returns no scoped data for unknown users', () => {
    const dashboardData = getAccessScopedDashboardData('missing-user')

    expect(dashboardData.effectiveAccess.role).toBe('none')
    expect(dashboardData.devices).toEqual([])
    expect(dashboardData.alerts).toEqual([])
    expect(dashboardData.cameraFeeds).toEqual([])
    expect(dashboardData.projects).toEqual([])
  })
})
