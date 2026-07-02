import {
  defaultMockUserId,
  getAccessScopedDashboardData,
  getEffectiveAccess,
} from '../../../src/services/accessControl'
import { discoveredDevices as mockDiscoveredDevices } from '../../../src/mocks/discoveredDevices'
import { registerDiscoveredDevice } from '../../../src/features/devices/deviceRegistration'
import type { Alert, CameraFeed, Device, DiscoveredDevice, EffectiveAccess, Project, SensorEvent } from '../../../src/types/domain'
import { getConfiguredCameraFeeds } from './cameraFeedProvider'
import { getLocalSensorEvents, ingestLocalSensorEvent, type SensorEventInput } from './localSensorEventService'

export type ProjectDraftInput = Pick<Project, 'name' | 'customer' | 'site' | 'status'>
export type RegisterDeviceInput = {
  discoveredDeviceId: string
  displayName: string
}

export function getDevices(userId = defaultMockUserId): Device[] {
  return getAccessScopedDashboardData(userId).devices
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

  return getConfiguredCameraFeeds()
    .filter((cameraFeed) => allowedProjectIds.has(cameraFeed.projectId) && allowedDeviceIds.has(cameraFeed.deviceId))
    .map((cameraFeed) => ({ ...cameraFeed }))
}

export function getAccess(userId = defaultMockUserId): EffectiveAccess {
  return getEffectiveAccess(userId)
}

export function getDiscoveredDevices(userId = defaultMockUserId): DiscoveredDevice[] {
  const effectiveAccess = getEffectiveAccess(userId)
  const allowedDeviceTypes = new Set(effectiveAccess.allowedDeviceTypes)

  return mockDiscoveredDevices
    .filter((device) => allowedDeviceTypes.has(device.type))
    .map((device) => ({ ...device }))
}

export function getSensorEvents(userId = defaultMockUserId): SensorEvent[] {
  const allowedDeviceIds = new Set(getDevices(userId).map((device) => device.id))

  return getLocalSensorEvents()
    .filter((event) => allowedDeviceIds.has(event.deviceId))
}

export async function createSensorEvent(input: SensorEventInput, userId = defaultMockUserId): Promise<SensorEvent | null> {
  const allowedDeviceIds = new Set(getDevices(userId).map((device) => device.id))

  if (!allowedDeviceIds.has(input.deviceId)) {
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

  return result.ok ? result.device : null
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
