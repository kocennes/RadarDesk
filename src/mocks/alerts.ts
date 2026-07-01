import type { Alert } from '../types/domain'

export const alerts: Alert[] = [
  {
    id: 'alert-1001',
    title: 'Low altitude track',
    severity: 'critical',
    sourceDeviceId: 'radar-001',
    area: 'North perimeter',
    timestamp: '14:18',
  },
  {
    id: 'alert-1002',
    title: 'Unknown RF burst',
    severity: 'high',
    sourceDeviceId: 'rf-002',
    area: 'East tower',
    timestamp: '14:16',
  },
  {
    id: 'alert-1003',
    title: 'Camera verification pending',
    severity: 'medium',
    sourceDeviceId: 'eo-003',
    area: 'Command roof',
    timestamp: '14:12',
  },
]
