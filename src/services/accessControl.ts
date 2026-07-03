import { accessGroups, groupMemberships, productPackages } from '../mocks/accessModel'
import { alerts as mockAlerts } from '../mocks/alerts'
import { cameraFeeds as mockCameraFeeds } from '../mocks/cameraFeeds'
import { devices as mockDevices } from '../mocks/devices'
import { projects as mockProjects } from '../mocks/projects'
import { users as mockUsers } from '../mocks/users'
import type {
  AccessGroup,
  Alert,
  CameraFeed,
  CommandType,
  Device,
  DeviceType,
  EffectiveAccess,
  ProductModule,
  ProductPackage,
  ProductPackageKey,
  Project,
  UserRole,
} from '../types/domain'

export type AccessScopedDashboardData = {
  devices: Device[]
  alerts: Alert[]
  projects: Project[]
  cameraFeeds: CameraFeed[]
  effectiveAccess: EffectiveAccess
}

export const defaultMockUserId = 'user-admin-001'

const roleRank: Record<UserRole, number> = {
  viewer: 1,
  operator: 2,
  admin: 3,
}

const commandRequirements: Record<
  CommandType,
  {
    allowedDeviceTypes: DeviceType[]
    minimumRole: UserRole
    requiredModule: ProductModule
    requiresSupervisorApproval: boolean
  }
> = {
  'ptz-slew': {
    allowedDeviceTypes: ['eo-ir'],
    minimumRole: 'operator',
    requiredModule: 'camera-feeds',
    requiresSupervisorApproval: false,
  },
  'camera-preset': {
    allowedDeviceTypes: ['eo-ir'],
    minimumRole: 'operator',
    requiredModule: 'camera-feeds',
    requiresSupervisorApproval: false,
  },
  'capture-evidence': {
    allowedDeviceTypes: ['eo-ir'],
    minimumRole: 'operator',
    requiredModule: 'camera-feeds',
    requiresSupervisorApproval: false,
  },
  'countermeasure-request': {
    allowedDeviceTypes: ['c2'],
    minimumRole: 'admin',
    requiredModule: 'c2',
    requiresSupervisorApproval: true,
  },
  cancel: {
    allowedDeviceTypes: ['c2', 'eo-ir'],
    minimumRole: 'operator',
    requiredModule: 'c2',
    requiresSupervisorApproval: false,
  },
}

export type CommandAccessDecision = {
  allowed: boolean
  reason: string
  requiresSupervisorApproval: boolean
}

export function getProductPackages(): ProductPackage[] {
  return productPackages.map((productPackage) => ({
    ...productPackage,
    allowedDeviceTypes: [...productPackage.allowedDeviceTypes],
    allowedModules: [...productPackage.allowedModules],
  }))
}

export function getAccessGroups(): AccessGroup[] {
  return accessGroups.map((accessGroup) => ({
    ...accessGroup,
    projectIds: [...accessGroup.projectIds],
  }))
}

export function getEffectiveAccess(userId = defaultMockUserId): EffectiveAccess {
  const user = mockUsers.find((candidate) => candidate.id === userId && candidate.status === 'active')

  if (!user) {
    return createEmptyAccess(userId)
  }

  const userGroups = groupMemberships
    .filter((membership) => membership.userId === user.id)
    .map((membership) => accessGroups.find((group) => group.id === membership.accessGroupId))
    .filter((group): group is AccessGroup => Boolean(group))

  if (userGroups.length === 0) {
    return createEmptyAccess(user.id)
  }

  const packageById = new Map(productPackages.map((productPackage) => [productPackage.id, productPackage]))
  const allowedDeviceTypes = new Set<DeviceType>()
  const allowedModules = new Set<ProductModule>()
  const customerIds = new Set<string>()
  const packageIds = new Set<ProductPackageKey>()
  const projectIds = new Set<string>()
  let role: UserRole = userGroups[0].role

  for (const group of userGroups) {
    customerIds.add(group.customerId)
    group.projectIds.forEach((projectId) => projectIds.add(projectId))
    packageIds.add(group.packageId)

    if (roleRank[group.role] > roleRank[role]) {
      role = group.role
    }

    const productPackage = packageById.get(group.packageId)

    productPackage?.allowedDeviceTypes.forEach((deviceType) => allowedDeviceTypes.add(deviceType))
    productPackage?.allowedModules.forEach((module) => allowedModules.add(module))
  }

  return {
    userId: user.id,
    role,
    customerIds: [...customerIds],
    projectIds: [...projectIds],
    packageIds: [...packageIds],
    allowedDeviceTypes: [...allowedDeviceTypes],
    allowedModules: [...allowedModules],
  }
}

export function getAccessScopedDashboardData(userId = defaultMockUserId): AccessScopedDashboardData {
  const effectiveAccess = getEffectiveAccess(userId)
  const allowedProjectIds = new Set(effectiveAccess.projectIds)
  const allowedDeviceTypes = new Set(effectiveAccess.allowedDeviceTypes)
  const devices = mockDevices.filter(
    (device) => allowedProjectIds.has(device.projectId) && allowedDeviceTypes.has(device.type),
  )
  const allowedDeviceIds = new Set(devices.map((device) => device.id))
  const alerts = mockAlerts.filter(
    (alert) => allowedProjectIds.has(alert.projectId) && allowedDeviceIds.has(alert.sourceDeviceId),
  )
  const cameraFeeds = effectiveAccess.allowedModules.includes('camera-feeds')
    ? mockCameraFeeds.filter(
        (cameraFeed) => allowedProjectIds.has(cameraFeed.projectId) && allowedDeviceIds.has(cameraFeed.deviceId),
      )
    : []
  const projects = mockProjects.filter((project) => allowedProjectIds.has(project.id))

  return {
    devices: devices.map((device) => ({ ...device })),
    alerts: alerts.map((alert) => ({ ...alert })),
    projects: projects.map((project) => ({ ...project })),
    cameraFeeds: cameraFeeds.map((cameraFeed) => ({ ...cameraFeed })),
    effectiveAccess: cloneEffectiveAccess(effectiveAccess),
  }
}

export function canRequestCommand(
  effectiveAccess: EffectiveAccess,
  device: Device | null | undefined,
  commandType: CommandType,
): CommandAccessDecision {
  const requirement = commandRequirements[commandType]

  if (!requirement) {
    return denyCommand('Command type is not supported.')
  }

  if (!device) {
    return denyCommand('Command device could not be found.')
  }

  if (effectiveAccess.role === 'none') {
    return denyCommand('User has no active access.')
  }

  if (!effectiveAccess.projectIds.includes(device.projectId)) {
    return denyCommand('Device project is outside of user access.')
  }

  if (!effectiveAccess.allowedDeviceTypes.includes(device.type)) {
    return denyCommand('Device type is outside of user package.')
  }

  if (!requirement.allowedDeviceTypes.includes(device.type)) {
    return denyCommand('Command is not valid for this device type.')
  }

  if (!effectiveAccess.allowedModules.includes(requirement.requiredModule)) {
    return denyCommand('Required command module is outside of user package.')
  }

  if (roleRank[effectiveAccess.role] < roleRank[requirement.minimumRole]) {
    return denyCommand('User role is not allowed to request this command.')
  }

  return {
    allowed: true,
    reason: 'Command request is allowed in dry-run/mock mode.',
    requiresSupervisorApproval: requirement.requiresSupervisorApproval,
  }
}

function createEmptyAccess(userId: string): EffectiveAccess {
  return {
    userId,
    role: 'none',
    customerIds: [],
    projectIds: [],
    packageIds: [],
    allowedDeviceTypes: [],
    allowedModules: [],
  }
}

function cloneEffectiveAccess(effectiveAccess: EffectiveAccess): EffectiveAccess {
  return {
    ...effectiveAccess,
    customerIds: [...effectiveAccess.customerIds],
    projectIds: [...effectiveAccess.projectIds],
    packageIds: [...effectiveAccess.packageIds],
    allowedDeviceTypes: [...effectiveAccess.allowedDeviceTypes],
    allowedModules: [...effectiveAccess.allowedModules],
  }
}

function denyCommand(reason: string): CommandAccessDecision {
  return {
    allowed: false,
    reason,
    requiresSupervisorApproval: false,
  }
}
