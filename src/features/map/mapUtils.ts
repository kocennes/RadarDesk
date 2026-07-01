import type { Device } from '../../types/domain'

export type LatLngTuple = [number, number]

export function getMapCenter(devices: Device[]): LatLngTuple {
  if (devices.length === 0) {
    return [41.0082, 28.9784]
  }

  const total = devices.reduce(
    (position, device) => ({
      latitude: position.latitude + device.latitude,
      longitude: position.longitude + device.longitude,
    }),
    { latitude: 0, longitude: 0 },
  )

  return [total.latitude / devices.length, total.longitude / devices.length]
}

export function getRangeMeters(device: Device): number {
  return device.rangeKm * 1000
}
