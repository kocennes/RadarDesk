import type { DeviceCapability, DeviceIngestMode, DeviceProfile, DeviceRawSource } from '../../types/domain'

export const profileLabel: Record<DeviceProfile, string> = {
  c2: 'C2',
  radar: 'Radar',
  'rf-receiver': 'RF alici',
  'thermal-camera': 'Termal kamera',
  'visible-camera': 'Gorunur kamera',
}

export const ingestModeLabel: Record<DeviceIngestMode, string> = {
  file: 'Dosya',
  mock: 'Mock',
  snapshot: 'Snapshot',
  stream: 'Stream',
  'structured-events': 'Yapilandirilmis veri',
}

export const rawSourceLabel: Record<DeviceRawSource, string> = {
  'manual-config': 'Manuel config',
  mock: 'Mock',
  network: 'Ag',
  serial: 'Seri',
  usb: 'USB',
}

export const capabilityLabel: Record<DeviceCapability, string> = {
  'command-state': 'Komut/durum',
  'frequency-event': 'Frekans olayi',
  'motion-event': 'Hareket olayi',
  'object-event': 'Nesne olayi',
  'range-monitoring': 'Menzil izleme',
  'rf-alert': 'RF alarm',
  'signal-detection': 'Sinyal algilama',
  snapshot: 'Snapshot',
  'thermal-frame': 'Termal frame',
  'track-detection': 'Track algilama',
  'visible-frame': 'Gorunur frame',
  'zone-alert': 'Bolge alarmi',
}

export function formatCapabilities(capabilities: DeviceCapability[]): string {
  return capabilities.map((capability) => capabilityLabel[capability]).join(', ')
}
