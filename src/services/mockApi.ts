import { alerts as mockAlerts } from '../mocks/alerts'
import { cameraFeeds as mockCameraFeeds } from '../mocks/cameraFeeds'
import { discoveredDevices as mockDiscoveredDevices } from '../mocks/discoveredDevices'
import { devices as mockDevices } from '../mocks/devices'
import { projects as mockProjects } from '../mocks/projects'
import { sensorEvents as mockSensorEvents } from '../mocks/sensorEvents'
import { users as mockUsers } from '../mocks/users'
import type { Alert, CameraFeed, Device, DiscoveredDevice, EffectiveAccess, Incident, Project, SensorEvent, User } from '../types/domain'
import { buildIncidentsFromSensorEvents } from '../features/incidents/incidentCorrelation'
import { getAccessScopedDashboardData, getEffectiveAccess } from './accessControl'

export type MockDashboardData = {
  devices: Device[]
  alerts: Alert[]
  projects: Project[]
  users: User[]
  cameraFeeds: CameraFeed[]
  effectiveAccess: EffectiveAccess
  discoveredDevices: DiscoveredDevice[]
  sensorEvents: SensorEvent[]
  incidents: Incident[]
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

export function getMockCameraFeeds(): CameraFeed[] {
  return mockCameraFeeds.map((cameraFeed) => ({ ...cameraFeed }))
}

export async function fetchMockCameraFeeds(): Promise<CameraFeed[]> {
  return getMockCameraFeeds()
}

export function getMockDiscoveredDevices(): DiscoveredDevice[] {
  return mockDiscoveredDevices.map((device) => ({ ...device }))
}

export async function fetchMockDiscoveredDevices(): Promise<DiscoveredDevice[]> {
  return getMockDiscoveredDevices()
}

export function getMockSensorEvents(): SensorEvent[] {
  return mockSensorEvents.map((event) => ({
    ...event,
    evidence: event.evidence ? { ...event.evidence } : undefined,
    metadata: { ...event.metadata },
  }))
}

export async function fetchMockSensorEvents(): Promise<SensorEvent[]> {
  return getMockSensorEvents()
}

export function getMockIncidents(): Incident[] {
  return buildIncidentsFromSensorEvents(getMockSensorEvents(), getMockDevices())
}

export async function fetchMockIncidents(): Promise<Incident[]> {
  return getMockIncidents()
}

export function saveMockProjectDraft(project: ProjectSaveInput): Project {
  return {
    id: 'project-draft-local',
    customerId: 'customer-draft-local',
    name: project.name.trim(),
    customer: project.customer.trim(),
    site: project.site.trim(),
    status: project.status,
  }
}

export function getMockDashboardData(): MockDashboardData {
  const scopedData = getAccessScopedDashboardData()

  return {
    devices: scopedData.devices,
    alerts: scopedData.alerts,
    projects: scopedData.projects,
    users: getMockUsers(),
    cameraFeeds: scopedData.cameraFeeds,
    effectiveAccess: scopedData.effectiveAccess,
    discoveredDevices: getMockDiscoveredDevices(),
    sensorEvents: getMockSensorEvents(),
    incidents: buildIncidentsFromSensorEvents(getMockSensorEvents(), scopedData.devices),
  }
}

export async function fetchMockDashboardData(): Promise<MockDashboardData> {
  const [devices, alerts, projects, users, cameraFeeds, discoveredDevices, sensorEvents] = await Promise.all([
    fetchMockDevices(),
    fetchMockAlerts(),
    fetchMockProjects(),
    fetchMockUsers(),
    fetchMockCameraFeeds(),
    fetchMockDiscoveredDevices(),
    fetchMockSensorEvents(),
  ])

  return {
    devices,
    alerts,
    projects,
    users,
    cameraFeeds,
    effectiveAccess: getEffectiveAccess(),
    discoveredDevices,
    sensorEvents,
    incidents: buildIncidentsFromSensorEvents(sensorEvents, devices),
  }
}
