import { describe, expect, it } from 'vitest'
import { alerts } from '../mocks/alerts'
import { cameraFeeds } from '../mocks/cameraFeeds'
import { discoveredDevices } from '../mocks/discoveredDevices'
import { devices } from '../mocks/devices'
import { projects } from '../mocks/projects'
import { sensorEvents } from '../mocks/sensorEvents'
import { users } from '../mocks/users'
import {
  fetchMockDashboardData,
  fetchMockCameraFeeds,
  fetchMockDevices,
  fetchMockDiscoveredDevices,
  fetchMockIncidents,
  fetchMockSensorEvents,
  getMockAlerts,
  getMockCameraFeeds,
  getMockDashboardData,
  getMockDevices,
  getMockDiscoveredDevices,
  getMockIncidents,
  getMockProjects,
  getMockSensorEvents,
  getMockUsers,
  saveMockProjectDraft,
} from './mockApi'

describe('mockApi', () => {
  it('returns typed dashboard data from the mock source', () => {
    const dashboardData = getMockDashboardData()

    expect(dashboardData.devices).toHaveLength(devices.length)
    expect(dashboardData.alerts).toHaveLength(alerts.length)
    expect(dashboardData.projects).toHaveLength(projects.length)
    expect(dashboardData.users).toHaveLength(users.length)
    expect(dashboardData.cameraFeeds).toHaveLength(cameraFeeds.length)
    expect(dashboardData.discoveredDevices).toHaveLength(discoveredDevices.length)
    expect(dashboardData.sensorEvents).toHaveLength(sensorEvents.length)
    expect(dashboardData.incidents.length).toBeGreaterThan(0)
  })

  it('exposes async mock fetchers for the future API transition', async () => {
    await expect(fetchMockDevices()).resolves.toHaveLength(devices.length)
    await expect(fetchMockCameraFeeds()).resolves.toHaveLength(cameraFeeds.length)
    await expect(fetchMockDiscoveredDevices()).resolves.toHaveLength(discoveredDevices.length)
    await expect(fetchMockSensorEvents()).resolves.toHaveLength(sensorEvents.length)
    await expect(fetchMockIncidents()).resolves.toHaveLength(getMockIncidents().length)

    const dashboardData = await fetchMockDashboardData()

    expect(dashboardData).toEqual(getMockDashboardData())
  })

  it('returns cloned arrays and records to protect mock source data', () => {
    const mockDevices = getMockDevices()
    const mockAlerts = getMockAlerts()
    const mockProjects = getMockProjects()
    const mockUsers = getMockUsers()
    const mockCameraFeeds = getMockCameraFeeds()
    const mockDiscoveredDevices = getMockDiscoveredDevices()
    const mockSensorEvents = getMockSensorEvents()
    const mockIncidents = getMockIncidents()

    expect(mockDevices).not.toBe(devices)
    expect(mockAlerts).not.toBe(alerts)
    expect(mockProjects).not.toBe(projects)
    expect(mockUsers).not.toBe(users)
    expect(mockCameraFeeds).not.toBe(cameraFeeds)
    expect(mockDiscoveredDevices).not.toBe(discoveredDevices)
    expect(mockSensorEvents).not.toBe(sensorEvents)
    expect(mockIncidents[0].evidenceRefs[0]).not.toBe(getMockIncidents()[0].evidenceRefs[0])
    expect(mockDevices[0]).not.toBe(devices[0])
    expect(mockAlerts[0]).not.toBe(alerts[0])
    expect(mockProjects[0]).not.toBe(projects[0])
    expect(mockUsers[0]).not.toBe(users[0])
    expect(mockCameraFeeds[0]).not.toBe(cameraFeeds[0])
    expect(mockDiscoveredDevices[0]).not.toBe(discoveredDevices[0])
    expect(mockSensorEvents[0]).not.toBe(sensorEvents[0])
    expect(mockSensorEvents[0].metadata).not.toBe(sensorEvents[0].metadata)
  })

  it('builds incident summaries from local sensor events', () => {
    const incidents = getMockIncidents()

    expect(incidents[0]).toMatchObject({
      confirmationLevel: 'multi-sensor',
      projectId: 'project-001',
      status: 'reviewing',
    })
    expect(incidents[0].sensorEventIds.length).toBeGreaterThan(1)
    expect(incidents[0].confidence).toBeGreaterThanOrEqual(0.75)
  })

  it('keeps the mock role set aligned with the planned access model', () => {
    const roles = getMockUsers().map((user) => user.role)

    expect(roles).toContain('admin')
    expect(roles).toContain('operator')
    expect(roles).toContain('viewer')
  })

  it('includes effective access for the default full-ops mock user', () => {
    const dashboardData = getMockDashboardData()

    expect(dashboardData.effectiveAccess.packageIds).toContain('full-ops')
    expect(dashboardData.effectiveAccess.allowedDeviceTypes).toEqual(
      expect.arrayContaining(['radar', 'rf', 'eo-ir', 'c2']),
    )
    expect(dashboardData.effectiveAccess.allowedModules).toContain('camera-feeds')
  })

  it('saves a sanitized local project draft without mutating mock projects', () => {
    const savedProject = saveMockProjectDraft({
      name: '  Saha Kesfi  ',
      customer: '  Egitim Musterisi  ',
      site: '  Egitim Sahasi  ',
      status: 'draft',
    })

    expect(savedProject).toEqual({
      id: 'project-draft-local',
      customerId: 'customer-draft-local',
      name: 'Saha Kesfi',
      customer: 'Egitim Musterisi',
      site: 'Egitim Sahasi',
      status: 'draft',
    })
    expect(projects).toHaveLength(1)
  })
})
