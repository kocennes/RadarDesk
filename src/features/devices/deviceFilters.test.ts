import { describe, expect, it } from 'vitest'
import { devices } from '../../mocks/devices'
import { filterDevices } from './deviceFilters'

describe('filterDevices', () => {
  it('filters devices by status', () => {
    const result = filterDevices(devices, {
      searchTerm: '',
      status: 'online',
    })

    expect(result.map((device) => device.id)).toEqual(['radar-001', 'eo-003'])
  })

  it('filters devices by search term', () => {
    const result = filterDevices(devices, {
      searchTerm: 'east',
      status: 'all',
    })

    expect(result.map((device) => device.id)).toEqual(['rf-002'])
  })

  it('combines search term and status filters', () => {
    const result = filterDevices(devices, {
      searchTerm: 'tower',
      status: 'warning',
    })

    expect(result.map((device) => device.id)).toEqual(['rf-002'])
  })
})
