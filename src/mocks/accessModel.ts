import type { AccessGroup, GroupMembership, ProductPackage } from '../types/domain'

export const productPackages: ProductPackage[] = [
  {
    id: 'camera-thermal',
    name: 'Camera + Thermal',
    allowedDeviceTypes: ['eo-ir'],
    allowedModules: ['dashboard', 'devices', 'alerts', 'map', 'camera-feeds'],
  },
  {
    id: 'rf-monitoring',
    name: 'RF Monitoring',
    allowedDeviceTypes: ['rf'],
    allowedModules: ['dashboard', 'devices', 'alerts', 'map', 'rf-monitoring'],
  },
  {
    id: 'radar-ops',
    name: 'Radar Ops',
    allowedDeviceTypes: ['radar'],
    allowedModules: ['dashboard', 'devices', 'alerts', 'map', 'radar-ops'],
  },
  {
    id: 'full-ops',
    name: 'Full Ops',
    allowedDeviceTypes: ['radar', 'rf', 'eo-ir', 'c2'],
    allowedModules: ['dashboard', 'devices', 'alerts', 'map', 'camera-feeds', 'rf-monitoring', 'radar-ops', 'c2'],
  },
]

export const accessGroups: AccessGroup[] = [
  {
    id: 'group-training-full-ops',
    name: 'Training Full Ops',
    customerId: 'customer-training',
    projectIds: ['project-001'],
    packageId: 'full-ops',
    role: 'admin',
  },
  {
    id: 'group-training-camera-viewers',
    name: 'Training Camera Viewers',
    customerId: 'customer-training',
    projectIds: ['project-001'],
    packageId: 'camera-thermal',
    role: 'viewer',
  },
]

export const groupMemberships: GroupMembership[] = [
  {
    id: 'membership-admin-full-ops',
    userId: 'user-admin-001',
    accessGroupId: 'group-training-full-ops',
  },
  {
    id: 'membership-operator-full-ops',
    userId: 'user-operator-001',
    accessGroupId: 'group-training-full-ops',
  },
  {
    id: 'membership-viewer-camera',
    userId: 'user-viewer-001',
    accessGroupId: 'group-training-camera-viewers',
  },
]
