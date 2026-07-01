import type { Device, DeviceStatus } from '../../types/domain'

export type DeviceStatusFilter = DeviceStatus | 'all'

export type DeviceFilters = {
  searchTerm: string
  status: DeviceStatusFilter
}

export function filterDevices(devices: Device[], filters: DeviceFilters): Device[] {
  const normalizedSearchTerm = filters.searchTerm.trim().toLowerCase()

  return devices.filter((device) => {
    const matchesStatus = filters.status === 'all' || device.status === filters.status
    const matchesSearch =
      normalizedSearchTerm.length === 0 ||
      device.name.toLowerCase().includes(normalizedSearchTerm) ||
      device.location.toLowerCase().includes(normalizedSearchTerm) ||
      device.type.toLowerCase().includes(normalizedSearchTerm)

    return matchesStatus && matchesSearch
  })
}
