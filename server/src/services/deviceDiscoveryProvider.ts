import { discoveredDevices as mockDiscoveredDevices } from '../../../src/mocks/discoveredDevices'
import type {
  DeviceCapability,
  DeviceConnectionType,
  DeviceIngestMode,
  DeviceProfile,
  DeviceRawSource,
  DeviceType,
  DiscoveredDevice,
} from '../../../src/types/domain'

const deviceTypes: DeviceType[] = ['c2', 'eo-ir', 'radar', 'rf']
const deviceProfiles: DeviceProfile[] = ['c2', 'radar', 'rf-receiver', 'thermal-camera', 'visible-camera']
const deviceIngestModes: DeviceIngestMode[] = ['file', 'mock', 'snapshot', 'stream', 'structured-events']
const deviceRawSources: DeviceRawSource[] = ['manual-config', 'mock', 'network', 'serial', 'usb']
const deviceConnectionTypes: DeviceConnectionType[] = ['network', 'serial', 'usb']
const deviceCapabilities: DeviceCapability[] = [
  'command-state',
  'frequency-event',
  'motion-event',
  'object-event',
  'range-monitoring',
  'rf-alert',
  'signal-detection',
  'snapshot',
  'thermal-frame',
  'track-detection',
  'visible-frame',
  'zone-alert',
]

export function getConfiguredDiscoveredDevices(): DiscoveredDevice[] {
  if (process.env.DEVICE_DISCOVERY_SOURCE?.trim() !== 'config') {
    return cloneDiscoveredDevices(mockDiscoveredDevices)
  }

  return parseConfiguredDiscoveredDevices(process.env.DEVICE_DISCOVERY_JSON)
}

function parseConfiguredDiscoveredDevices(rawJson: string | undefined): DiscoveredDevice[] {
  if (!rawJson?.trim()) {
    return []
  }

  try {
    const parsed = JSON.parse(rawJson) as unknown

    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed.flatMap((candidate) => {
      const device = parseDiscoveredDevice(candidate)

      return device ? [device] : []
    })
  } catch {
    return []
  }
}

function parseDiscoveredDevice(value: unknown): DiscoveredDevice | null {
  if (!isRecord(value)) {
    return null
  }

  const id = getStringField(value, 'id')
  const type = getEnumField(value, 'type', deviceTypes)
  const profile = getEnumField(value, 'profile', deviceProfiles)
  const ingestMode = getEnumField(value, 'ingestMode', deviceIngestModes)
  const rawSource = getEnumField(value, 'rawSource', deviceRawSources)
  const connectionType = getEnumField(value, 'connectionType', deviceConnectionTypes)
  const label = getStringField(value, 'label')
  const model = getStringField(value, 'model')
  const address = getStringField(value, 'address')
  const status = getEnumField(value, 'status', ['available', 'configured'])
  const capabilities = getCapabilities(value.capabilities)
  const detectedAt = getStringField(value, 'detectedAt') || new Date().toISOString()

  if (!id || !type || !profile || !ingestMode || !rawSource || !connectionType || !label || !model || !address || !status) {
    return null
  }

  return {
    address,
    capabilities,
    connectionType,
    detectedAt,
    id,
    ingestMode,
    label,
    model,
    profile,
    rawSource,
    status,
    type,
  }
}

function cloneDiscoveredDevices(devices: DiscoveredDevice[]): DiscoveredDevice[] {
  return devices.map((device) => ({
    ...device,
    capabilities: [...device.capabilities],
  }))
}

function getCapabilities(value: unknown): DeviceCapability[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value.filter((capability): capability is DeviceCapability =>
    typeof capability === 'string' && deviceCapabilities.includes(capability as DeviceCapability),
  )
}

function getEnumField<T extends string>(record: Record<string, unknown>, field: string, allowedValues: readonly T[]): T | '' {
  const value = getStringField(record, field)

  return allowedValues.includes(value as T) ? (value as T) : ''
}

function getStringField(record: Record<string, unknown>, field: string): string {
  const value = record[field]

  return typeof value === 'string' ? value.trim() : ''
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
