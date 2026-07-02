import request from 'supertest'
import { afterEach, describe, expect, it } from 'vitest'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { alerts } from '../../src/mocks/alerts'
import { cameraFeeds } from '../../src/mocks/cameraFeeds'
import { discoveredDevices } from '../../src/mocks/discoveredDevices'
import { devices } from '../../src/mocks/devices'
import { projects } from '../../src/mocks/projects'
import { sensorEvents } from '../../src/mocks/sensorEvents'
import { createApp } from './app'

const app = createApp()
const originalCameraFeedSource = process.env.CAMERA_FEED_SOURCE
const originalCameraFeedsJson = process.env.CAMERA_FEEDS_JSON
const originalLocalEvidenceDir = process.env.LOCAL_EVIDENCE_DIR

afterEach(() => {
  setOptionalEnv('CAMERA_FEED_SOURCE', originalCameraFeedSource)
  setOptionalEnv('CAMERA_FEEDS_JSON', originalCameraFeedsJson)
  setOptionalEnv('LOCAL_EVIDENCE_DIR', originalLocalEvidenceDir)
})

describe('RadarDesk API', () => {
  it('returns a health response', async () => {
    const response = await request(app).get('/health').expect(200)

    expect(response.body).toEqual({
      status: 'ok',
      service: 'radardesk-api',
    })
  })

  it('returns mock device, alert, project, and camera feed lists', async () => {
    const [
      devicesResponse,
      alertsResponse,
      projectsResponse,
      cameraFeedsResponse,
      accessResponse,
      discoveryResponse,
      sensorEventsResponse,
    ] = await Promise.all([
      request(app).get('/api/devices').expect(200),
      request(app).get('/api/alerts').expect(200),
      request(app).get('/api/projects').expect(200),
      request(app).get('/api/camera-feeds').expect(200),
      request(app).get('/api/access').expect(200),
      request(app).get('/api/device-discovery').expect(200),
      request(app).get('/api/sensor-events').expect(200),
    ])

    expect(devicesResponse.body.data).toHaveLength(devices.length)
    expect(alertsResponse.body.data).toHaveLength(alerts.length)
    expect(projectsResponse.body.data).toHaveLength(projects.length)
    expect(cameraFeedsResponse.body.data).toHaveLength(cameraFeeds.length)
    expect(accessResponse.body.data.packageIds).toContain('full-ops')
    expect(discoveryResponse.body.data).toHaveLength(discoveredDevices.length)
    expect(sensorEventsResponse.body.data).toHaveLength(sensorEvents.length)
  })

  it('filters API responses by effective access for a limited mock user', async () => {
    const [devicesResponse, alertsResponse, cameraFeedsResponse, accessResponse, sensorEventsResponse] = await Promise.all([
      request(app).get('/api/devices').set('x-mock-user-id', 'user-viewer-001').expect(200),
      request(app).get('/api/alerts').set('x-mock-user-id', 'user-viewer-001').expect(200),
      request(app).get('/api/camera-feeds').set('x-mock-user-id', 'user-viewer-001').expect(200),
      request(app).get('/api/access').set('x-mock-user-id', 'user-viewer-001').expect(200),
      request(app).get('/api/sensor-events').set('x-mock-user-id', 'user-viewer-001').expect(200),
    ])

    expect(devicesResponse.body.data.map((device: { type: string }) => device.type)).toEqual(['eo-ir'])
    expect(alertsResponse.body.data.map((alert: { sourceDeviceId: string }) => alert.sourceDeviceId)).toEqual([
      'eo-003',
    ])
    expect(cameraFeedsResponse.body.data).toHaveLength(2)
    expect(accessResponse.body.data).toMatchObject({
      role: 'viewer',
      allowedDeviceTypes: ['eo-ir'],
      packageIds: ['camera-thermal'],
    })
    expect(sensorEventsResponse.body.data.map((event: { deviceId: string }) => event.deviceId)).toEqual(['eo-003'])
  })

  it('registers a discovered device with a user-provided display name', async () => {
    const response = await request(app)
      .post('/api/devices/register')
      .send({
        discoveredDeviceId: 'discovered-camera-001',
        displayName: 'Giris Kamera',
      })
      .expect(201)

    expect(response.body.data).toMatchObject({
      id: 'registered-discovered-camera-001',
      name: 'Giris Kamera',
      type: 'eo-ir',
      profile: 'thermal-camera',
      customerId: 'customer-training',
      projectId: 'project-001',
    })
  })

  it('rejects invalid discovered device registration payloads', async () => {
    const response = await request(app)
      .post('/api/devices/register')
      .send({
        discoveredDeviceId: 'discovered-camera-001',
        displayName: '',
      })
      .expect(400)

    expect(response.body).toEqual({
      error: {
        code: 'invalid_device_registration',
        message: 'Device name must be at least 2 characters.',
      },
    })
  })

  it('can expose real camera metadata from backend env without leaking stream URLs', async () => {
    process.env.CAMERA_FEED_SOURCE = 'real'
    process.env.CAMERA_FEEDS_JSON = JSON.stringify([
      {
        id: 'real-camera-feed-001',
        customerId: 'customer-training',
        projectId: 'project-001',
        name: 'Lab Kamera Gorsel Kanal',
        deviceId: 'eo-003',
        status: 'online',
        mode: 'day',
        fieldOfView: 'Kapali test alani',
        lastFrameAt: '2026-07-02T10:30:00.000Z',
        streamUrl: 'rtsp://camera-user:camera-password@192.0.2.10/live',
        snapshotUrl: 'http://192.0.2.10/snapshot.jpg',
      },
    ])

    const response = await request(app).get('/api/camera-feeds').expect(200)

    expect(response.body.data).toEqual([
      {
        id: 'real-camera-feed-001',
        customerId: 'customer-training',
        projectId: 'project-001',
        name: 'Lab Kamera Gorsel Kanal',
        deviceId: 'eo-003',
        status: 'online',
        mode: 'day',
        fieldOfView: 'Kapali test alani',
        lastFrameAt: '2026-07-02T10:30:00.000Z',
        source: 'real',
      },
    ])
    expect(JSON.stringify(response.body.data)).not.toContain('camera-password')
    expect(JSON.stringify(response.body.data)).not.toContain('rtsp://')
  })

  it('captures a mock camera snapshot into local evidence without exposing camera URLs', async () => {
    const evidenceDir = await mkdtemp(path.join(tmpdir(), 'radardesk-evidence-'))
    process.env.LOCAL_EVIDENCE_DIR = evidenceDir

    try {
      const response = await request(app).post('/api/camera-feeds/camera-feed-001/snapshot').expect(201)

      expect(response.body.data).toMatchObject({
        contentType: 'text/plain',
        feedId: 'camera-feed-001',
      })
      expect(response.body.data.snapshotPath).toContain('camera-feed-001')
      expect(response.body.data.hash).toHaveLength(64)
      expect(JSON.stringify(response.body.data)).not.toContain('snapshotUrl')
      expect(JSON.stringify(response.body.data)).not.toContain('rtsp://')

      const content = await readFile(path.resolve(response.body.data.snapshotPath), 'utf8')
      expect(content).toContain('mock snapshot for camera-feed-001')
    } finally {
      await rm(evidenceDir, { force: true, recursive: true })
    }
  })

  it('automatically captures local evidence when a camera sensor event is ingested', async () => {
    const evidenceDir = await mkdtemp(path.join(tmpdir(), 'radardesk-event-evidence-'))
    process.env.LOCAL_EVIDENCE_DIR = evidenceDir

    try {
      const response = await request(app)
        .post('/api/sensor-events/ingest')
        .send({
          cameraFeedId: 'camera-feed-001',
          deviceId: 'eo-003',
          kind: 'thermal-motion',
          metadata: {
            area: 'Arka bahce',
            confidence: 0.91,
          },
          severity: 'high',
        })
        .expect(201)

      expect(response.body.data).toMatchObject({
        deviceId: 'eo-003',
        kind: 'thermal-motion',
        severity: 'high',
      })
      expect(response.body.data.evidence.snapshotPath).toContain('camera-feed-001')
      expect(response.body.data.evidence.hash).toHaveLength(64)
      expect(response.body.data.metadata).toMatchObject({
        area: 'Arka bahce',
        confidence: 0.91,
        ingest: 'local-backend',
      })

      const content = await readFile(path.resolve(response.body.data.evidence.snapshotPath), 'utf8')
      expect(content).toContain('mock snapshot for camera-feed-001')
    } finally {
      await rm(evidenceDir, { force: true, recursive: true })
    }
  })

  it('stores radar sensor events as local structured evidence without snapshot evidence', async () => {
    const evidenceDir = await mkdtemp(path.join(tmpdir(), 'radardesk-radar-evidence-'))
    process.env.LOCAL_EVIDENCE_DIR = evidenceDir

    try {
      const response = await request(app)
        .post('/api/sensor-events/ingest')
        .send({
          deviceId: 'radar-001',
          kind: 'radar-track',
          metadata: {
            rangeM: 380,
            trackId: 'T-200',
          },
          severity: 'medium',
        })
        .expect(201)

      expect(response.body.data).toMatchObject({
        deviceId: 'radar-001',
        evidence: {
          dataPath: expect.stringContaining('radar-001'),
          hash: expect.any(String),
        },
        kind: 'radar-track',
        metadata: {
          ingest: 'local-backend',
          rangeM: 380,
          trackId: 'T-200',
        },
        severity: 'medium',
      })
      expect(response.body.data.evidence).not.toHaveProperty('snapshotPath')
      expect(response.body.data.evidence.hash).toHaveLength(64)

      const content = await readFile(path.resolve(response.body.data.evidence.dataPath), 'utf8')
      const storedEvent = JSON.parse(content) as { deviceId: string; kind: string; metadata: { trackId: string } }
      expect(storedEvent).toMatchObject({
        deviceId: 'radar-001',
        kind: 'radar-track',
        metadata: {
          trackId: 'T-200',
        },
      })
    } finally {
      await rm(evidenceDir, { force: true, recursive: true })
    }
  })

  it('rejects invalid sensor event ingest payloads', async () => {
    const response = await request(app)
      .post('/api/sensor-events/ingest')
      .send({
        deviceId: 'eo-003',
        kind: 'not-real',
        severity: 'high',
      })
      .expect(400)

    expect(response.body).toEqual({
      error: {
        code: 'invalid_sensor_event',
        message: 'Sensor event kind is invalid.',
      },
    })
  })

  it('returns a safe error for unknown snapshot feeds', async () => {
    const response = await request(app).post('/api/camera-feeds/missing-feed/snapshot').expect(404)

    expect(response.body).toEqual({
      error: {
        code: 'camera_feed_not_found',
        message: 'Camera feed could not be found.',
      },
    })
  })

  it('creates a sanitized mock project draft', async () => {
    const response = await request(app)
      .post('/api/projects')
      .send({
        name: '  Field Survey  ',
        customer: '  Training Customer  ',
        site: '  Training Site  ',
        status: 'draft',
        role: 'admin',
      })
      .expect(201)

    expect(response.body.data).toEqual({
      id: 'project-draft-local',
      customerId: 'customer-draft-local',
      name: 'Field Survey',
      customer: 'Training Customer',
      site: 'Training Site',
      status: 'draft',
    })
  })

  it('does not persist extra client fields in the project response', async () => {
    const response = await request(app)
      .post('/api/projects')
      .send({
        name: 'Field Survey',
        customer: 'Training Customer',
        site: 'Training Site',
        status: 'draft',
        role: 'admin',
        createdBy: 'client-user',
        projectId: 'override-id',
      })
      .expect(201)

    expect(response.body.data).toEqual({
      id: 'project-draft-local',
      customerId: 'customer-draft-local',
      name: 'Field Survey',
      customer: 'Training Customer',
      site: 'Training Site',
      status: 'draft',
    })
    expect(response.body.data).not.toHaveProperty('role')
    expect(response.body.data).not.toHaveProperty('createdBy')
    expect(response.body.data).not.toHaveProperty('projectId')
  })

  it('rejects non-object project payloads', async () => {
    const response = await request(app).post('/api/projects').send('invalid-payload').expect(400)

    expect(response.body).toEqual({
      error: {
        code: 'invalid_project',
        message: 'Project payload is required.',
      },
    })
  })

  it('rejects invalid project payloads', async () => {
    const response = await request(app)
      .post('/api/projects')
      .send({
        name: '',
        customer: 'Training Customer',
        site: 'Training Site',
        status: 'draft',
      })
      .expect(400)

    expect(response.body).toEqual({
      error: {
        code: 'invalid_project',
        message: 'Project name is required.',
      },
    })
  })

  it.each([
    {
      name: 'missing payload',
      payload: undefined,
      message: 'Project payload is required.',
    },
    {
      name: 'missing customer',
      payload: {
        name: 'Field Survey',
        customer: '',
        site: 'Training Site',
        status: 'draft',
      },
      message: 'Customer is required.',
    },
    {
      name: 'long site',
      payload: {
        name: 'Field Survey',
        customer: 'Training Customer',
        site: 'A'.repeat(81),
        status: 'draft',
      },
      message: 'Site must be 80 characters or fewer.',
    },
    {
      name: 'invalid status',
      payload: {
        name: 'Field Survey',
        customer: 'Training Customer',
        site: 'Training Site',
        status: 'approved',
      },
      message: 'Project status is invalid.',
    },
  ])('rejects project payloads with $name', async ({ payload, message }) => {
    const requestBuilder = request(app).post('/api/projects')
    const response = await (payload === undefined ? requestBuilder : requestBuilder.send(payload)).expect(400)

    expect(response.body).toEqual({
      error: {
        code: 'invalid_project',
        message,
      },
    })
  })
})

function setOptionalEnv(key: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[key]
    return
  }

  process.env[key] = value
}
