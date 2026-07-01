import { describe, expect, it } from 'vitest'
import { alerts } from '../../mocks/alerts'
import { devices } from '../../mocks/devices'
import { getAlertOverlays, getMapCenter, getRangeMeters } from './mapUtils'

describe('map utilities', () => {
  it('calculates map center from device coordinates', () => {
    const center = getMapCenter(devices)

    expect(center[0]).toBeCloseTo(41.00725)
    expect(center[1]).toBeCloseTo(28.9795)
  })

  it('converts kilometers to meters for range circles', () => {
    expect(getRangeMeters(devices[0])).toBe(4000)
  })

  it('returns a default center when no devices exist', () => {
    expect(getMapCenter([])).toEqual([41.0082, 28.9784])
  })

  it('places alert overlays on their source device coordinates', () => {
    const overlays = getAlertOverlays(alerts, devices)

    expect(overlays[0]).toEqual({
      alert: alerts[0],
      position: [devices[0].latitude, devices[0].longitude],
    })
    expect(overlays).toHaveLength(alerts.length)
  })

  it('skips alert overlays when the source device is not visible', () => {
    const overlays = getAlertOverlays(alerts, [])

    expect(overlays).toEqual([])
  })
})
