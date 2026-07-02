import type {
  Alert,
  CameraFeed,
  Device,
  DiscoveredDevice,
  EffectiveAccess,
  Incident,
  IncidentStatus,
  Project,
  AlertSeverity,
  SensorEvent,
  SensorEventKind,
} from '../types/domain'
import { registerDiscoveredDevice, type DeviceRegistrationResult } from '../features/devices/deviceRegistration'
import {
  fetchMockDashboardData,
  fetchMockCameraFeeds,
  fetchMockDiscoveredDevices,
  fetchMockIncidents,
  fetchMockSensorEvents,
  fetchMockUsers,
  saveMockProjectDraft,
  type MockDashboardData,
  type ProjectSaveInput,
} from './mockApi'

type ApiDataResponse<T> = {
  data: T
}

export type SensorEventIngestInput = {
  deviceId: string
  kind: SensorEventKind
  severity: AlertSeverity
  metadata: Record<string, string | number | boolean>
  cameraFeedId?: string
}

export type IncidentReviewUpdateInput = {
  incident: Incident
  operatorNote?: string
  status: IncidentStatus
}

export async function fetchDashboardData(apiBaseUrl = getApiBaseUrl()): Promise<MockDashboardData> {
  if (!apiBaseUrl) {
    return fetchMockDashboardData()
  }

  const mockDashboardData = await fetchMockDashboardData()
  const [devices, alerts, projects, users, cameraFeeds, effectiveAccess, discoveredDevices, sensorEvents, incidents] = await Promise.all([
    fetchApiData<Device[]>(apiBaseUrl, '/api/devices'),
    fetchApiData<Alert[]>(apiBaseUrl, '/api/alerts'),
    fetchApiData<Project[]>(apiBaseUrl, '/api/projects'),
    fetchMockUsers(),
    fetchApiData<CameraFeed[]>(apiBaseUrl, '/api/camera-feeds').catch(() => fetchMockCameraFeeds()),
    fetchApiData<EffectiveAccess>(apiBaseUrl, '/api/access').catch(() => mockDashboardData.effectiveAccess),
    fetchApiData<DiscoveredDevice[]>(apiBaseUrl, '/api/device-discovery').catch(() => fetchMockDiscoveredDevices()),
    fetchApiData<SensorEvent[]>(apiBaseUrl, '/api/sensor-events').catch(() => fetchMockSensorEvents()),
    fetchApiData<Incident[]>(apiBaseUrl, '/api/incidents').catch(() => fetchMockIncidents()),
  ])

  return {
    devices,
    alerts,
    projects,
    users,
    cameraFeeds,
    effectiveAccess,
    discoveredDevices,
    sensorEvents,
    incidents,
  }
}

export async function ingestSensorEvent(
  input: SensorEventIngestInput,
  apiBaseUrl = getApiBaseUrl(),
): Promise<SensorEvent> {
  if (!apiBaseUrl) {
    return createMockIngestedSensorEvent(input)
  }

  return fetchApiData<SensorEvent>(apiBaseUrl, '/api/sensor-events/ingest', {
    body: JSON.stringify(input),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })
}

export async function updateIncidentReview(
  input: IncidentReviewUpdateInput,
  apiBaseUrl = getApiBaseUrl(),
): Promise<Incident> {
  const body = {
    operatorNote: input.operatorNote,
    status: input.status,
  }

  if (!apiBaseUrl) {
    return {
      ...input.incident,
      confirmationLevel: input.status === 'confirmed' ? 'operator-confirmed' : input.incident.confirmationLevel,
      operatorNote: input.operatorNote?.trim() || undefined,
      status: input.status,
      updatedAt: new Date().toISOString(),
    }
  }

  return fetchApiData<Incident>(apiBaseUrl, `/api/incidents/${input.incident.id}/review`, {
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'PATCH',
  })
}

export async function disconnectDevice(device: Device, apiBaseUrl = getApiBaseUrl()): Promise<Device> {
  if (!apiBaseUrl) {
    return {
      ...device,
      status: 'offline',
      lastSeen: 'baglanti kaldirildi',
    }
  }

  return fetchApiData<Device>(apiBaseUrl, `/api/devices/${device.id}/disconnect`, {
    method: 'PATCH',
  })
}

export async function deleteDevice(deviceId: string, apiBaseUrl = getApiBaseUrl()): Promise<void> {
  if (!apiBaseUrl) {
    return
  }

  await fetchApiNoContent(apiBaseUrl, `/api/devices/${deviceId}`, {
    method: 'DELETE',
  })
}

export async function saveProjectDraft(
  project: ProjectSaveInput,
  apiBaseUrl = getApiBaseUrl(),
): Promise<Project> {
  if (!apiBaseUrl) {
    return saveMockProjectDraft(project)
  }

  return fetchApiData<Project>(apiBaseUrl, '/api/projects', {
    body: JSON.stringify(project),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })
}

export async function registerDeviceFromDiscovery(
  input: {
    discoveredDeviceId: string
    displayName: string
    project: Project | undefined
    discoveredDevices: DiscoveredDevice[]
  },
  apiBaseUrl = getApiBaseUrl(),
): Promise<DeviceRegistrationResult> {
  if (!apiBaseUrl) {
    const project = input.project

    if (!project) {
      return { ok: false, message: 'Once proje baglami yuklenmelidir.' }
    }

    return registerDiscoveredDevice({
      discoveredDeviceId: input.discoveredDeviceId,
      discoveredDevices: input.discoveredDevices,
      displayName: input.displayName,
      project,
    })
  }

  try {
    const device = await fetchApiData<Device>(apiBaseUrl, '/api/devices/register', {
      body: JSON.stringify({
        discoveredDeviceId: input.discoveredDeviceId,
        displayName: input.displayName,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })

    return { ok: true, device }
  } catch {
    return { ok: false, message: 'Cihaz kaydi tamamlanamadi.' }
  }
}

function createMockIngestedSensorEvent(input: SensorEventIngestInput): SensorEvent {
  const isCameraEvent =
    input.kind === 'thermal-motion' || input.kind === 'camera-motion' || input.kind === 'camera-object'

  return {
    id: `event-${input.kind}-${Date.now()}`,
    deviceId: input.deviceId,
    kind: input.kind,
    severity: input.severity,
    detectedAt: new Date().toISOString(),
    metadata: {
      ...input.metadata,
      ingest: 'local-frontend-mock',
    },
    evidence:
      isCameraEvent && input.cameraFeedId
        ? {
            hash: `mock-${input.cameraFeedId}`,
            snapshotPath: `local-evidence/${input.cameraFeedId}-mock-snapshot.txt`,
          }
        : !isCameraEvent
          ? {
              dataPath: `local-evidence/${input.deviceId}-${input.kind}-mock-event.json`,
              hash: `mock-${input.deviceId}-${input.kind}`,
            }
        : undefined,
  }
}

async function fetchApiData<T>(apiBaseUrl: string, path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, init)

  if (!response.ok) {
    throw new Error('API request failed.')
  }

  const body = (await response.json()) as ApiDataResponse<T>

  return body.data
}

async function fetchApiNoContent(apiBaseUrl: string, path: string, init?: RequestInit): Promise<void> {
  const response = await fetch(`${apiBaseUrl}${path}`, init)

  if (!response.ok) {
    throw new Error('API request failed.')
  }
}

function getApiBaseUrl(): string {
  return import.meta.env.VITE_API_BASE_URL?.trim() ?? ''
}
