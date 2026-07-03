export type DeviceStatus = 'online' | 'offline' | 'warning' | 'alarm'

export type DeviceType = 'radar' | 'rf' | 'eo-ir' | 'c2'

export type DeviceProfile = 'thermal-camera' | 'visible-camera' | 'radar' | 'rf-receiver' | 'c2'

export type DeviceCapability =
  | 'snapshot'
  | 'visible-frame'
  | 'thermal-frame'
  | 'motion-event'
  | 'object-event'
  | 'track-detection'
  | 'range-monitoring'
  | 'zone-alert'
  | 'signal-detection'
  | 'frequency-event'
  | 'rf-alert'
  | 'command-state'

export type DeviceIngestMode = 'mock' | 'snapshot' | 'stream' | 'structured-events' | 'file'

export type DeviceRawSource = 'mock' | 'network' | 'usb' | 'serial' | 'manual-config'

export type Device = {
  id: string
  customerId: string
  projectId: string
  name: string
  type: DeviceType
  profile: DeviceProfile
  capabilities: DeviceCapability[]
  ingestMode: DeviceIngestMode
  rawSource: DeviceRawSource
  status: DeviceStatus
  location: string
  latitude: number
  longitude: number
  rangeKm: number
  lastSeen: string
}

export type DeviceConnectionType = 'network' | 'usb' | 'serial'

export type DiscoveredDevice = {
  id: string
  type: DeviceType
  profile: DeviceProfile
  capabilities: DeviceCapability[]
  ingestMode: DeviceIngestMode
  rawSource: DeviceRawSource
  connectionType: DeviceConnectionType
  label: string
  model: string
  address: string
  status: 'available' | 'configured'
  detectedAt: string
}

export type SensorEventKind =
  | 'thermal-motion'
  | 'camera-motion'
  | 'camera-object'
  | 'radar-track'
  | 'radar-zone'
  | 'rf-signal'
  | 'rf-frequency'
  | 'device-state'

export type LocalEvidenceRef = {
  snapshotPath?: string
  clipPath?: string
  dataPath?: string
  hash?: string
}

export type StoredEvidence = LocalEvidenceRef & {
  capturedAt: string
  contentType: string
  feedId: string
  sizeBytes: number
}

export type SensorEvent = {
  id: string
  deviceId: string
  kind: SensorEventKind
  severity: AlertSeverity
  detectedAt: string
  metadata: Record<string, string | number | boolean>
  evidence?: LocalEvidenceRef
}

export type IncidentStatus = 'open' | 'reviewing' | 'confirmed' | 'dismissed'

export type IncidentConfirmationLevel = 'single-sensor' | 'multi-sensor' | 'operator-confirmed'

export type Incident = {
  id: string
  projectId: string
  title: string
  severity: AlertSeverity
  confidence: number
  confirmationLevel: IncidentConfirmationLevel
  status: IncidentStatus
  sensorEventIds: string[]
  sourceDeviceIds: string[]
  evidenceRefs: LocalEvidenceRef[]
  operatorNote?: string
  createdAt: string
  updatedAt: string
}

export type CameraFeedStatus = 'online' | 'standby' | 'offline'

export type CameraFeed = {
  id: string
  customerId: string
  projectId: string
  name: string
  deviceId: string
  status: CameraFeedStatus
  mode: 'day' | 'thermal'
  fieldOfView: string
  lastFrameAt: string
  source: 'mock' | 'real'
}

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical'

export type Alert = {
  id: string
  customerId: string
  projectId: string
  title: string
  severity: AlertSeverity
  sourceDeviceId: string
  area: string
  timestamp: string
}

export type Project = {
  id: string
  customerId: string
  name: string
  customer: string
  site: string
  status: 'draft' | 'survey' | 'active'
}

export type UserRole = 'admin' | 'operator' | 'viewer'

export type User = {
  id: string
  name: string
  role: UserRole
  email: string
  status: 'active' | 'inactive'
}

export type ProductPackageKey = 'camera-thermal' | 'rf-monitoring' | 'radar-ops' | 'full-ops'

export type ProductModule =
  | 'dashboard'
  | 'devices'
  | 'alerts'
  | 'map'
  | 'camera-feeds'
  | 'rf-monitoring'
  | 'radar-ops'
  | 'c2'

export type ProductPackage = {
  id: ProductPackageKey
  name: string
  allowedDeviceTypes: DeviceType[]
  allowedModules: ProductModule[]
}

export type AccessGroup = {
  id: string
  name: string
  customerId: string
  projectIds: string[]
  packageId: ProductPackageKey
  role: UserRole
}

export type GroupMembership = {
  id: string
  userId: string
  accessGroupId: string
}

export type EffectiveAccess = {
  userId: string
  role: UserRole | 'none'
  customerIds: string[]
  projectIds: string[]
  packageIds: ProductPackageKey[]
  allowedDeviceTypes: DeviceType[]
  allowedModules: ProductModule[]
}

export type CommandType =
  | 'ptz-slew'
  | 'camera-preset'
  | 'capture-evidence'
  | 'countermeasure-request'
  | 'cancel'

export type CommandApprovalState =
  | 'none'
  | 'operator-approved'
  | 'supervisor-required'
  | 'approved'
  | 'rejected'
  | 'expired'

export type CommandStatus =
  | 'requested'
  | 'pending-approval'
  | 'executing'
  | 'succeeded'
  | 'failed'
  | 'cancelled'

export type CommandRiskLevel = 'low' | 'medium' | 'high'

export type CommandRequest = {
  id: string
  commandType: CommandType
  deviceId: string
  projectId: string
  requestedBy: string
  approvalState: CommandApprovalState
  status: CommandStatus
  riskLevel: CommandRiskLevel
  targetId?: string
  incidentId?: string
  reason?: string
  createdAt: string
  updatedAt: string
}

export type CommandResult = {
  command: CommandRequest
  safeMessage: string
}
