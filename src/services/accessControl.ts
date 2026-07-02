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
