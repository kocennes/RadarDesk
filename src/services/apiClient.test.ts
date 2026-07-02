import { afterEach, describe, expect, it, vi } from 'vitest'
import { alerts } from '../mocks/alerts'
import { cameraFeeds } from '../mocks/cameraFeeds'
import { discoveredDevices } from '../mocks/discoveredDevices'
import { devices } from '../mocks/devices'
import { projects } from '../mocks/projects'
import { sensorEvents } from '../mocks/sensorEvents'
import { buildIncidentsFromSensorEvents } from '../features/incidents/incidentCorrelation'
import {
  deleteDevice,
  disconnectDevice,
  fetchDashboardData,
  ingestSensorEvent,
  registerDeviceFromDiscovery,
  saveProjectDraft,
  updateIncidentReview,
} from './apiClient'

describe('apiClient', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('falls back to safe mock data when no API base URL is configured', async () => {
    const dashboardData = await fetchDashboardData('')

    expect(dashboardData.devices).toHaveLength(devices.length)
    expect(dashboardData.alerts).toHaveLength(alerts.length)
    expect(dashboardData.projects).toHaveLength(projects.length)
    expect(dashboardData.cameraFeeds).toHaveLength(cameraFeeds.length)
    expect(dashboardData.discoveredDevices).toHaveLength(discoveredDevices.length)
    expect(dashboardData.sensorEvents).toHaveLength(sensorEvents.length)
    expect(dashboardData.incidents.length).toBeGreaterThan(0)
  })

  it('loads dashboard lists from the configured API base URL', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = String(input)

      if (url.endsWith('/api/devices')) {
        return jsonResponse({ data: devices })
      }

      if (url.endsWith('/api/alerts')) {
        return jsonResponse({ data: alerts })
      }

      if (url.endsWith('/api/projects')) {
        return jsonResponse({ data: projects })
      }

      if (url.endsWith('/api/camera-feeds')) {
        return jsonResponse({ data: cameraFeeds })
      }

      if (url.endsWith('/api/access')) {
        return jsonResponse({
          data: {
            userId: 'user-admin-001',
            role: 'admin',
            customerIds: ['customer-training'],
            projectIds: ['project-001'],
            packageIds: ['full-ops'],
            allowedDeviceTypes: ['radar', 'rf', 'eo-ir', 'c2'],
            allowedModules: ['dashboard', 'devices', 'alerts', 'map', 'camera-feeds', 'rf-monitoring', 'radar-ops', 'c2'],
          },
        })
      }

      if (url.endsWith('/api/device-discovery')) {
        return jsonResponse({ data: discoveredDevices })
      }

      if (url.endsWith('/api/sensor-events')) {
        return jsonResponse({ data: sensorEvents })
      }

      if (url.endsWith('/api/incidents')) {
        return jsonResponse({ data: buildIncidentsFromSensorEvents(sensorEvents, devices) })
      }

      return jsonResponse({ data: [] }, false)
    })

    const dashboardData = await fetchDashboardData('http://localhost:4000')

    expect(fetchMock).toHaveBeenCalledTimes(8)
    expect(dashboardData.devices).toHaveLength(devices.length)
    expect(dashboardData.alerts).toHaveLength(alerts.length)
    expect(dashboardData.projects).toHaveLength(projects.length)
    expect(dashboardData.cameraFeeds).toHaveLength(cameraFeeds.length)
    expect(dashboardData.discoveredDevices).toHaveLength(discoveredDevices.length)
    expect(dashboardData.sensorEvents).toHaveLength(sensorEvents.length)
    expect(dashboardData.incidents.length).toBeGreaterThan(0)
  })

  it('registers a discovered device through the configured API base URL', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      jsonResponse({
        data: {
          id: 'registered-discovered-camera-001',
          customerId: 'customer-training',
          projectId: 'project-001',
          name: 'Giris Kamera',
          type: 'eo-ir',
          profile: 'thermal-camera',
          capabilities: ['snapshot', 'thermal-frame', 'motion-event', 'object-event'],
          ingestMode: 'snapshot',
          rawSource: 'network',
          status: 'online',
          location: 'Konum atanacak',
          latitude: 41.006,
          longitude: 28.976,
          rangeKm: 3,
          lastSeen: 'simdi',
        },
      }),
    )

    const result = await registerDeviceFromDiscovery(
      {
        discoveredDeviceId: 'discovered-camera-001',
        discoveredDevices,
        displayName: 'Giris Kamera',
        project: projects[0],
      },
      'http://localhost:4000',
    )

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:4000/api/devices/register',
      expect.objectContaining({
        body: JSON.stringify({
          discoveredDeviceId: 'discovered-camera-001',
          displayName: 'Giris Kamera',
        }),
        method: 'POST',
      }),
    )
    expect(result).toMatchObject({ ok: true, device: { name: 'Giris Kamera' } })
  })

  it('posts project drafts to the configured API base URL', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      jsonResponse({
        data: {
          id: 'project-draft-local',
          name: 'Saha Kesfi',
          customer: 'Egitim Musterisi',
          site: 'Egitim Sahasi',
          status: 'draft',
        },
      }),
    )

    const savedProject = await saveProjectDraft(
      {
        name: 'Saha Kesfi',
        customer: 'Egitim Musterisi',
        site: 'Egitim Sahasi',
        status: 'draft',
      },
      'http://localhost:4000',
    )

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:4000/api/projects',
      expect.objectContaining({
        method: 'POST',
      }),
    )
    expect(savedProject.name).toBe('Saha Kesfi')
  })

  it('posts sensor ingest events to the configured API base URL', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      jsonResponse({
        data: {
          detectedAt: '2026-07-02T10:00:00.000Z',
          deviceId: 'radar-001',
          evidence: {
            dataPath: 'local-evidence/radar-001-radar-track.json',
            hash: 'backend-radar-hash',
          },
          id: 'event-radar-track-test',
          kind: 'radar-track',
          metadata: {
            rangeM: 350,
            trackId: 'T-TEST-001',
          },
          severity: 'medium',
        },
      }),
    )

    const event = await ingestSensorEvent(
      {
        deviceId: 'radar-001',
        kind: 'radar-track',
        metadata: {
          rangeM: 350,
          trackId: 'T-TEST-001',
        },
        severity: 'medium',
      },
      'http://localhost:4000',
    )

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:4000/api/sensor-events/ingest',
      expect.objectContaining({
        body: JSON.stringify({
          deviceId: 'radar-001',
          kind: 'radar-track',
          metadata: {
            rangeM: 350,
            trackId: 'T-TEST-001',
          },
          severity: 'medium',
        }),
        method: 'POST',
      }),
    )
    expect(event).toMatchObject({
      deviceId: 'radar-001',
      evidence: {
        dataPath: 'local-evidence/radar-001-radar-track.json',
        hash: 'backend-radar-hash',
      },
      kind: 'radar-track',
      severity: 'medium',
    })
  })

  it('updates incident reviews through the configured API base URL', async () => {
    const incident = buildIncidentsFromSensorEvents(sensorEvents, devices)[0]
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      jsonResponse({
        data: {
          ...incident,
          confirmationLevel: 'operator-confirmed',
          operatorNote: 'Incelendi.',
          status: 'confirmed',
          updatedAt: '2026-07-02T10:40:00.000Z',
        },
      }),
    )

    const updatedIncident = await updateIncidentReview(
      {
        incident,
        operatorNote: 'Incelendi.',
        status: 'confirmed',
      },
      'http://localhost:4000',
    )

    expect(fetchMock).toHaveBeenCalledWith(
      `http://localhost:4000/api/incidents/${incident.id}/review`,
      expect.objectContaining({
        body: JSON.stringify({
          operatorNote: 'Incelendi.',
          status: 'confirmed',
        }),
        method: 'PATCH',
      }),
    )
    expect(updatedIncident).toMatchObject({
      confirmationLevel: 'operator-confirmed',
      id: incident.id,
      operatorNote: 'Incelendi.',
      status: 'confirmed',
    })
  })

  it('updates incident reviews with the mock fallback when no API base URL is configured', async () => {
    const incident = buildIncidentsFromSensorEvents(sensorEvents, devices)[0]

    const updatedIncident = await updateIncidentReview(
      {
        incident,
        operatorNote: '  Yerel inceleme notu  ',
        status: 'dismissed',
      },
      '',
    )

    expect(updatedIncident).toMatchObject({
      confirmationLevel: 'multi-sensor',
      id: incident.id,
      operatorNote: 'Yerel inceleme notu',
      status: 'dismissed',
    })
  })

  it('disconnects devices through the configured API base URL', async () => {
    const device = devices[0]
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      jsonResponse({
        data: {
          ...device,
          lastSeen: 'baglanti kaldirildi',
          status: 'offline',
        },
      }),
    )

    const disconnectedDevice = await disconnectDevice(device, 'http://localhost:4000')

    expect(fetchMock).toHaveBeenCalledWith(
      `http://localhost:4000/api/devices/${device.id}/disconnect`,
      expect.objectContaining({
        method: 'PATCH',
      }),
    )
    expect(disconnectedDevice).toMatchObject({
      id: device.id,
      lastSeen: 'baglanti kaldirildi',
      status: 'offline',
    })
  })

  it('deletes devices through the configured API base URL', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({}, true))

    await deleteDevice('radar-001', 'http://localhost:4000')

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:4000/api/devices/radar-001',
      expect.objectContaining({
        method: 'DELETE',
      }),
    )
  })

  it('disconnects devices with the mock fallback when no API base URL is configured', async () => {
    const disconnectedDevice = await disconnectDevice(devices[0], '')

    expect(disconnectedDevice).toMatchObject({
      id: devices[0].id,
      lastSeen: 'baglanti kaldirildi',
      status: 'offline',
    })
  })

  it('creates a local mock ingest event with structured evidence for radar when no API base URL is configured', async () => {
    const event = await ingestSensorEvent(
      {
        deviceId: 'radar-001',
        kind: 'radar-track',
        metadata: {
          rangeM: 350,
          trackId: 'T-TEST-001',
        },
        severity: 'medium',
      },
      '',
    )

    expect(event).toMatchObject({
      deviceId: 'radar-001',
      evidence: {
        dataPath: 'local-evidence/radar-001-radar-track-mock-event.json',
        hash: 'mock-radar-001-radar-track',
      },
      kind: 'radar-track',
      metadata: {
        ingest: 'local-frontend-mock',
        rangeM: 350,
        trackId: 'T-TEST-001',
      },
      severity: 'medium',
    })
  })

  it('creates a local mock ingest event with camera evidence when no API base URL is configured', async () => {
    const event = await ingestSensorEvent(
      {
        cameraFeedId: 'camera-feed-001',
        deviceId: 'eo-003',
        kind: 'thermal-motion',
        metadata: {
          confidence: 0.88,
        },
        severity: 'high',
      },
      '',
    )

    expect(event).toMatchObject({
      deviceId: 'eo-003',
      evidence: {
        hash: 'mock-camera-feed-001',
        snapshotPath: 'local-evidence/camera-feed-001-mock-snapshot.txt',
      },
      kind: 'thermal-motion',
      metadata: {
        confidence: 0.88,
        ingest: 'local-frontend-mock',
      },
      severity: 'high',
    })
  })

  it('saves project drafts with the mock fallback when no API base URL is configured', async () => {
    const savedProject = await saveProjectDraft(
      {
        name: '  Saha Kesfi  ',
        customer: '  Egitim Musterisi  ',
        site: '  Egitim Sahasi  ',
        status: 'draft',
      },
      '',
    )

    expect(savedProject).toEqual({
      id: 'project-draft-local',
      customerId: 'customer-draft-local',
      name: 'Saha Kesfi',
      customer: 'Egitim Musterisi',
      site: 'Egitim Sahasi',
      status: 'draft',
    })
  })

  it('throws a safe error when the API request fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ error: { code: 'bad', message: 'Bad' } }, false))

    await expect(fetchDashboardData('http://localhost:4000')).rejects.toThrow('API request failed.')
  })
})

function jsonResponse(body: unknown, ok = true): Response {
  return {
    json: async () => body,
    ok,
  } as Response
}
