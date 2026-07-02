import type { CameraFeed, Device } from '../../types/domain'

export function createCameraFeedForRegisteredDevice(device: Device): CameraFeed | null {
  if (device.type !== 'eo-ir') {
    return null
  }

  return {
    id: `camera-feed-${device.id}`,
    customerId: device.customerId,
    projectId: device.projectId,
    name: `${device.name} kanali`,
    deviceId: device.id,
    status: device.status === 'offline' ? 'offline' : 'standby',
    mode: device.capabilities.includes('thermal-frame') ? 'thermal' : 'day',
    fieldOfView: device.location,
    lastFrameAt: 'event bekleniyor',
    source: 'mock',
  }
}
