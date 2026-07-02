import {
  defaultMockUserId,
  getAccessScopedDashboardData,
  getEffectiveAccess,
} from '../../../src/services/accessControl'
import { createCameraFeedForRegisteredDevice } from '../../../src/features/cameras/cameraFeedRegistration'
import { registerDiscoveredDevice } from '../../../src/features/devices/deviceRegistration'
import { buildIncidentsFromSensorEvents } from '../../../src/features/incidents/incidentCorrelation'
import type { Alert, CameraFeed, Device, DiscoveredDevice, EffectiveAccess, Incident, Project, SensorEvent } from '../../../src/types/domain'
import { getConfiguredCameraFeeds } from './cameraFeedProvider'
import { getConfiguredDiscoveredDevices } from './deviceDiscoveryProvider'
import { applyIncidentReviews, saveIncidentReview, type IncidentReviewInput } from './localIncidentReviewService'
import { getLocalSensorEvents, ingestLocalSensorEvent, type SensorEventInput } from './localSensorEventService'

export type ProjectDraftInput = Pick<Project, 'name' | 'customer' | 'site' | 'status'>
export type RegisterDeviceInput = {
  discoveredDeviceId: string
  displayName: string
}

let registeredDevices: Device[] | null = null

export function getDevices(userId = defaultMockUserId): Device[] {
  const effectiveAccess = getEffectiveAccess(userId)
  const allowedProjectIds = new Set(effectiveAccess.projectIds)
  const allowedDeviceTypes = new Set(effectiveAccess.allowedDeviceTypes)

  return getRegisteredDevices()
    .filter((device) => allowedProjectIds.has(device.projectId) && allowedDeviceTypes.has(device.type))
    .map((device) => ({ ...device, capabilities: [...device.capabilities] }))
}

export function getAlerts(userId = defaultMockUserId): Alert[] {
  return getAccessScopedDashboardData(userId).alerts
}

export function getProjects(userId = defaultMockUserId): Project[] {
  return getAccessScopedDashboardData(userId).projects
}

export function getCameraFeeds(userId = defaultMockUserId): CameraFeed[] {
  const effectiveAccess = getEffectiveAccess(userId)

  if (!effectiveAccess.allowedModules.includes('camera-feeds')) {
    return []
  }

  const allowedProjectIds = new Set(effectiveAccess.projectIds)
  const allowedDeviceIds = new Set(getDevices(userId).map((device) => device.id))
  const configuredFeeds = getConfiguredCameraFeeds()
    .filter((cameraFeed) => allowedProjectIds.has(cameraFeed.projectId) && allowedDeviceIds.has(cameraFeed.deviceId))
  const configuredFeedDeviceIds = new Set(configuredFeeds.map((cameraFeed) => cameraFeed.deviceId))
  const registeredCameraFeeds = getDevices(userId)
    .filter((device) => device.type === 'eo-ir' && !configuredFeedDeviceIds.has(device.id))
    .map((device) => createCameraFeedForRegisteredDevice(device))
    .filter((cameraFeed): cameraFeed is CameraFeed => cameraFeed !== null)

  return [...configuredFeeds, ...registeredCameraFeeds]
    .map((cameraFeed) => ({ ...cameraFeed }))
}

export function getAccess(userId = defaultMockUserId): EffectiveAccess {
  return getEffectiveAccess(userId)
}

export function getDiscoveredDevices(userId = defaultMockUserId): DiscoveredDevice[] {
  const effectiveAccess = getEffectiveAccess(userId)
  const allowedDeviceTypes = new Set(effectiveAccess.allowedDeviceTypes)

  return getConfiguredDiscoveredDevices()
    .filter((device) => allowedDeviceTypes.has(device.type))
    .map((device) => ({ ...device }))
}

export function getSensorEvents(userId = defaultMockUserId): SensorEvent[] {
  const allowedDeviceIds = new Set(getDevices(userId).map((device) => device.id))

  return getLocalSensorEvents()
    .filter((event) => allowedDeviceIds.has(event.deviceId))
}

export function getIncidents(userId = defaultMockUserId): Incident[] {
  const devices = getDevices(userId)

  return applyIncidentReviews(buildIncidentsFromSensorEvents(getSensorEvents(userId), devices))
}

export function updateIncidentReview(
  incidentId: string,
  input: IncidentReviewInput,
  userId = defaultMockUserId,
): Incident | null {
  const incident = getIncidents(userId).find((candidate) => candidate.id === incidentId)

  if (!incident) {
    return null
  }

  saveIncidentReview(incidentId, input)

  return getIncidents(userId).find((candidate) => candidate.id === incidentId) ?? null
}

export async function createSensorEvent(input: SensorEventInput, userId = defaultMockUserId): Promise<SensorEvent | null> {
  const activeDeviceIds = new Set(
    getDevices(userId)
      .filter((device) => device.status !== 'offline')
      .map((device) => device.id),
  )

  if (!activeDeviceIds.has(input.deviceId)) {
    return null
  }

  if (input.cameraFeedId) {
    const allowedCameraFeedIds = new Set(getCameraFeeds(userId).map((cameraFeed) => cameraFeed.id))

    if (!allowedCameraFeedIds.has(input.cameraFeedId)) {
      return null
    }
  }

  return ingestLocalSensorEvent(input)
}

export function createRegisteredDevice(input: RegisterDeviceInput, userId = defaultMockUserId): Device | null {
  const project = getProjects(userId)[0]

  if (!project) {
    return null
  }

  const result = registerDiscoveredDevice({
    discoveredDeviceId: input.discoveredDeviceId,
    discoveredDevices: getDiscoveredDevices(userId),
    displayName: input.displayName,
    project,
  })

  if (!result.ok) {
    return null
  }

  upsertRegisteredDevice(result.device)

  return result.device
}

export function disconnectRegisteredDevice(deviceId: string, userId = defaultMockUserId): Device | null {
  const device = getDevices(userId).find((candidate) => candidate.id === deviceId)

  if (!device) {
    return null
  }

  const disconnectedDevice: Device = {
    ...device,
    status: 'offline',
    lastSeen: 'baglanti kaldirildi',
  }

  upsertRegisteredDevice(disconnectedDevice)

  return disconnectedDevice
}

export function deleteRegisteredDevice(deviceId: string, userId = defaultMockUserId): boolean {
  const device = getDevices(userId).find((candidate) => candidate.id === deviceId)

  if (!device) {
    return false
  }

  registeredDevices = getRegisteredDevices().filter((candidate) => candidate.id !== deviceId)

  return true
}

export function resetRegisteredDevicesForTests() {
  registeredDevices = null
}

export function createProjectDraft(input: ProjectDraftInput): Project {
  return {
    id: 'project-draft-local',
    customerId: 'customer-draft-local',
    name: input.name.trim(),
    customer: input.customer.trim(),
    site: input.site.trim(),
    status: input.status,
  }
}

export function getRequestedMockUserId(value: unknown): string {
  if (typeof value !== 'string') {
    return defaultMockUserId
  }

  return value.trim() || defaultMockUserId
}

function getRegisteredDevices(): Device[] {
  if (!registeredDevices) {
    registeredDevices = getAccessScopedDashboardData(defaultMockUserId).devices.map((device) => ({
      ...device,
      capabilities: [...device.capabilities],
    }))
  }

  return registeredDevices
}

function upsertRegisteredDevice(device: Device) {
  const devices = getRegisteredDevices()
  const existingDeviceIndex = devices.findIndex((candidate) => candidate.id === device.id)
  const storedDevice = {
    ...device,
    capabilities: [...device.capabilities],
  }

  if (existingDeviceIndex === -1) {
    registeredDevices = [...devices, storedDevice]
    return
  }

  registeredDevices = devices.map((candidate, index) => (index === existingDeviceIndex ? storedDevice : candidate))
}
