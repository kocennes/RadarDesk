import { describe, expect, it } from 'vitest'
import { devices } from '../mocks/devices'
import { canRequestCommand, getAccessScopedDashboardData, getEffectiveAccess, getProductPackages } from './accessControl'

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

  it('allows operator-grade camera commands only when role, package, and device match', () => {
    const adminAccess = getEffectiveAccess('user-admin-001')
    const viewerAccess = getEffectiveAccess('user-viewer-001')
    const cameraDevice = devices.find((device) => device.id === 'eo-003')

    expect(canRequestCommand(adminAccess, cameraDevice, 'ptz-slew')).toMatchObject({
      allowed: true,
      requiresSupervisorApproval: false,
    })
    expect(canRequestCommand(viewerAccess, cameraDevice, 'ptz-slew')).toMatchObject({
      allowed: false,
      reason: 'User role is not allowed to request this command.',
    })
  })

  it('requires admin C2 access and supervisor approval for countermeasure requests', () => {
    const adminAccess = getEffectiveAccess('user-admin-001')
    const viewerAccess = getEffectiveAccess('user-viewer-001')
    const c2Device = devices.find((device) => device.id === 'c2-004')

    expect(canRequestCommand(adminAccess, c2Device, 'countermeasure-request')).toMatchObject({
      allowed: true,
      requiresSupervisorApproval: true,
    })
    expect(canRequestCommand(viewerAccess, c2Device, 'countermeasure-request')).toMatchObject({
      allowed: false,
    })
  })
})
