import type { CameraFeed } from '../types/domain'

export const cameraFeeds: CameraFeed[] = [
  {
    id: 'camera-feed-001',
    customerId: 'customer-training',
    projectId: 'project-001',
    name: 'Kuzey PTZ gorsel kanal',
    deviceId: 'eo-003',
    status: 'online',
    mode: 'day',
    fieldOfView: 'Kuzey cevre',
    lastFrameAt: '14:19',
    source: 'mock',
  },
  {
    id: 'camera-feed-002',
    customerId: 'customer-training',
    projectId: 'project-001',
    name: 'Kuzey PTZ termal kanal',
    deviceId: 'eo-003',
    status: 'standby',
    mode: 'thermal',
    fieldOfView: 'Komuta catisi',
    lastFrameAt: '14:17',
    source: 'mock',
  },
]
