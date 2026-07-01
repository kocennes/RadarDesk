import { describe, expect, it } from 'vitest'
import { alerts } from '../../mocks/alerts'
import { devices } from '../../mocks/devices'
import { getDashboardViewData, getDashboardViewLabel } from './dashboardViewState'

describe('dashboard view state helpers', () => {
  it('keeps mock data visible in success mode', () => {
    expect(getDashboardViewData('success', devices, alerts)).toEqual({
      devices,
      alerts,
    })
  })

  it('uses empty arrays in empty and error modes', () => {
    expect(getDashboardViewData('empty', devices, alerts)).toEqual({
      devices: [],
      alerts: [],
    })

    expect(getDashboardViewData('error', devices, alerts)).toEqual({
      devices: [],
      alerts: [],
    })
  })

  it('returns readable labels for controls', () => {
    expect(getDashboardViewLabel('loading')).toBe('Loading demo')
    expect(getDashboardViewLabel('empty')).toBe('Empty demo')
    expect(getDashboardViewLabel('error')).toBe('Error demo')
    expect(getDashboardViewLabel('success')).toBe('Success demo')
  })
})
