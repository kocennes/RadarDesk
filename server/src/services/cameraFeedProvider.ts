import { cameraFeeds as mockCameraFeeds } from '../../../src/mocks/cameraFeeds'
import type { CameraFeed } from '../../../src/types/domain'

type CameraFeedSource = 'mock' | 'real'

export type CameraFeedConfig = CameraFeed & {
  snapshotUrl?: string
  streamUrl?: string
}

export function getConfiguredCameraFeeds(): CameraFeed[] {
  return getConfiguredCameraFeedConfigs().map(stripCameraFeedConfig)
}

export function getConfiguredCameraFeedConfigs(): CameraFeedConfig[] {
  if (getCameraFeedSource() !== 'real') {
    return mockCameraFeeds.map((cameraFeed) => ({ ...cameraFeed }))
  }

  return parseRealCameraFeeds(process.env.CAMERA_FEEDS_JSON)
}

export function getCameraFeedSource(): CameraFeedSource {
  return process.env.CAMERA_FEED_SOURCE === 'real' ? 'real' : 'mock'
}

export function getCameraFeedConfigById(cameraFeedId: string): CameraFeedConfig | undefined {
  return getConfiguredCameraFeedConfigs().find((cameraFeed) => cameraFeed.id === cameraFeedId)
}

export function parseRealCameraFeeds(value: string | undefined): CameraFeedConfig[] {
  if (!value) {
    return []
  }

  try {
    const parsed = JSON.parse(value) as unknown

    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed.flatMap((entry) => {
      const cameraFeed = parseRealCameraFeed(entry)

      return cameraFeed ? [cameraFeed] : []
    })
  } catch {
    return []
  }
}

function parseRealCameraFeed(value: unknown): CameraFeedConfig | null {
  if (!isRecord(value)) {
    return null
  }

  const id = getString(value, 'id')
  const customerId = getString(value, 'customerId')
  const projectId = getString(value, 'projectId')
  const name = getString(value, 'name')
  const deviceId = getString(value, 'deviceId')
  const status = getString(value, 'status')
  const mode = getString(value, 'mode')
  const fieldOfView = getString(value, 'fieldOfView')
  const lastFrameAt = getString(value, 'lastFrameAt')
  const snapshotUrl = getString(value, 'snapshotUrl')
  const streamUrl = getString(value, 'streamUrl')

  if (!id || !customerId || !projectId || !name || !deviceId || !fieldOfView) {
    return null
  }

  if (!isCameraFeedStatus(status) || !isCameraFeedMode(mode)) {
    return null
  }

  return {
    id,
    customerId,
    projectId,
    name,
    deviceId,
    status,
    mode,
    fieldOfView,
    lastFrameAt: lastFrameAt || new Date().toISOString(),
    snapshotUrl: snapshotUrl || undefined,
    source: 'real',
    streamUrl: streamUrl || undefined,
  }
}

function stripCameraFeedConfig(cameraFeed: CameraFeedConfig): CameraFeed {
  return {
    customerId: cameraFeed.customerId,
    deviceId: cameraFeed.deviceId,
    fieldOfView: cameraFeed.fieldOfView,
    id: cameraFeed.id,
    lastFrameAt: cameraFeed.lastFrameAt,
    mode: cameraFeed.mode,
    name: cameraFeed.name,
    projectId: cameraFeed.projectId,
    source: cameraFeed.source,
    status: cameraFeed.status,
  }
}

function getString(record: Record<string, unknown>, key: string): string {
  const value = record[key]

  return typeof value === 'string' ? value.trim() : ''
}

function isCameraFeedStatus(value: string): value is CameraFeed['status'] {
  return value === 'online' || value === 'standby' || value === 'offline'
}

function isCameraFeedMode(value: string): value is CameraFeed['mode'] {
  return value === 'day' || value === 'thermal'
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
