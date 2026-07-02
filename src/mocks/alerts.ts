import type { Alert } from '../types/domain'

export const alerts: Alert[] = [
  {
    id: 'alert-1001',
    customerId: 'customer-training',
    projectId: 'project-001',
    title: 'Alcak irtifa izi',
    severity: 'critical',
    sourceDeviceId: 'radar-001',
    area: 'Kuzey cevre',
    timestamp: '14:18',
  },
  {
    id: 'alert-1002',
    customerId: 'customer-training',
    projectId: 'project-001',
    title: 'Bilinmeyen RF patlamasi',
    severity: 'high',
    sourceDeviceId: 'rf-002',
    area: 'Dogu kule',
    timestamp: '14:16',
  },
  {
    id: 'alert-1003',
    customerId: 'customer-training',
    projectId: 'project-001',
    title: 'Kamera dogrulamasi bekliyor',
    severity: 'medium',
    sourceDeviceId: 'eo-003',
    area: 'Komuta catisi',
    timestamp: '14:12',
  },
]
