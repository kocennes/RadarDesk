import type { Device, DiscoveredDevice, Project } from '../../types/domain'

export type RegisterDeviceInput = {
  discoveredDeviceId: string
  displayName: string
  project: Project
  discoveredDevices: DiscoveredDevice[]
}

export type DeviceRegistrationResult =
  | { ok: true; device: Device }
  | { ok: false; message: string }

export function registerDiscoveredDevice(input: RegisterDeviceInput): DeviceRegistrationResult {
  const displayName = input.displayName.trim()

  if (displayName.length < 2) {
    return { ok: false, message: 'Cihaz adi en az 2 karakter olmalidir.' }
  }

  if (displayName.length > 60) {
    return { ok: false, message: 'Cihaz adi 60 karakter veya daha kisa olmalidir.' }
  }

  const discoveredDevice = input.discoveredDevices.find((candidate) => candidate.id === input.discoveredDeviceId)

  if (!discoveredDevice) {
    return { ok: false, message: 'Secilen cihaz bulunamadi.' }
  }

  return {
    ok: true,
    device: {
      id: `registered-${discoveredDevice.id}`,
      customerId: input.project.customerId,
      projectId: input.project.id,
      name: displayName,
      type: discoveredDevice.type,
      profile: discoveredDevice.profile,
      capabilities: [...discoveredDevice.capabilities],
      ingestMode: discoveredDevice.ingestMode,
      rawSource: discoveredDevice.rawSource,
      status: 'online',
      location: 'Konum atanacak',
      latitude: 41.006,
      longitude: 28.976,
      rangeKm: getDefaultRangeKm(discoveredDevice.type),
      lastSeen: 'simdi',
    },
  }
}

function getDefaultRangeKm(type: Device['type']): number {
  if (type === 'radar' || type === 'rf') {
    return 5
  }

  if (type === 'c2') {
    return 1
  }

  return 3
}
