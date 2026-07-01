import { describe, expect, it } from 'vitest'
import { alerts } from '../mocks/alerts'
import { devices } from '../mocks/devices'
import { projects } from '../mocks/projects'
import { users } from '../mocks/users'
import {
  fetchMockDashboardData,
  fetchMockDevices,
  getMockAlerts,
  getMockDashboardData,
  getMockDevices,
  getMockProjects,
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
  })

  it('exposes async mock fetchers for the future API transition', async () => {
    await expect(fetchMockDevices()).resolves.toHaveLength(devices.length)

    const dashboardData = await fetchMockDashboardData()

    expect(dashboardData).toEqual(getMockDashboardData())
  })

  it('returns cloned arrays and records to protect mock source data', () => {
    const mockDevices = getMockDevices()
    const mockAlerts = getMockAlerts()
    const mockProjects = getMockProjects()
    const mockUsers = getMockUsers()

    expect(mockDevices).not.toBe(devices)
    expect(mockAlerts).not.toBe(alerts)
    expect(mockProjects).not.toBe(projects)
    expect(mockUsers).not.toBe(users)
    expect(mockDevices[0]).not.toBe(devices[0])
    expect(mockAlerts[0]).not.toBe(alerts[0])
    expect(mockProjects[0]).not.toBe(projects[0])
    expect(mockUsers[0]).not.toBe(users[0])
  })

  it('keeps the mock role set aligned with the planned access model', () => {
    const roles = getMockUsers().map((user) => user.role)

    expect(roles).toContain('admin')
    expect(roles).toContain('operator')
    expect(roles).toContain('viewer')
  })

  it('saves a sanitized local project draft without mutating mock projects', () => {
    const savedProject = saveMockProjectDraft({
      name: '  Field Survey  ',
      customer: '  Training Customer  ',
      site: '  Demo Site  ',
      status: 'draft',
    })

    expect(savedProject).toEqual({
      id: 'project-draft-local',
      name: 'Field Survey',
      customer: 'Training Customer',
      site: 'Demo Site',
      status: 'draft',
    })
    expect(projects).toHaveLength(1)
  })
})
