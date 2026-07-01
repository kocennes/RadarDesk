import { alerts as mockAlerts } from '../mocks/alerts'
import { devices as mockDevices } from '../mocks/devices'
import { projects as mockProjects } from '../mocks/projects'
import { users as mockUsers } from '../mocks/users'
import type { Alert, Device, Project, User } from '../types/domain'

export type MockDashboardData = {
  devices: Device[]
  alerts: Alert[]
  projects: Project[]
  users: User[]
}

export type ProjectSaveInput = Pick<Project, 'name' | 'customer' | 'site' | 'status'>

export function getMockDevices(): Device[] {
  return mockDevices.map((device) => ({ ...device }))
}

export async function fetchMockDevices(): Promise<Device[]> {
  return getMockDevices()
}

export function getMockAlerts(): Alert[] {
  return mockAlerts.map((alert) => ({ ...alert }))
}

export async function fetchMockAlerts(): Promise<Alert[]> {
  return getMockAlerts()
}

export function getMockProjects(): Project[] {
  return mockProjects.map((project) => ({ ...project }))
}

export async function fetchMockProjects(): Promise<Project[]> {
  return getMockProjects()
}

export function getMockUsers(): User[] {
  return mockUsers.map((user) => ({ ...user }))
}

export async function fetchMockUsers(): Promise<User[]> {
  return getMockUsers()
}

export function saveMockProjectDraft(project: ProjectSaveInput): Project {
  return {
    id: 'project-draft-local',
    name: project.name.trim(),
    customer: project.customer.trim(),
    site: project.site.trim(),
    status: project.status,
  }
}

export function getMockDashboardData(): MockDashboardData {
  return {
    devices: getMockDevices(),
    alerts: getMockAlerts(),
    projects: getMockProjects(),
    users: getMockUsers(),
  }
}

export async function fetchMockDashboardData(): Promise<MockDashboardData> {
  const [devices, alerts, projects, users] = await Promise.all([
    fetchMockDevices(),
    fetchMockAlerts(),
    fetchMockProjects(),
    fetchMockUsers(),
  ])

  return {
    devices,
    alerts,
    projects,
    users,
  }
}
