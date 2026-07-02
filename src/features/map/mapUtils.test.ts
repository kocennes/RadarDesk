import { describe, expect, it } from 'vitest'
import { alerts } from '../../mocks/alerts'
import { devices } from '../../mocks/devices'
import {
  getAlertOverlays,
  getCameraSectorPoints,
  getDeviceBearingLine,
  getFeaturedIncidentOverlay,
  getMapCenter,
  getRangeMeters,
} from './mapUtils'

describe('map utilities', () => {
  it('calculates map center from device coordinates', () => {
    const center = getMapCenter(devices)

    expect(center[0]).toBeCloseTo(41.00725)
    expect(center[1]).toBeCloseTo(28.9795)
  })

  it('converts kilometers to meters for range circles', () => {
    expect(getRangeMeters(devices[0])).toBe(4000)
  })

  it('builds a camera sector polygon from device coordinates and range', () => {
    const cameraDevice = devices.find((device) => device.type === 'eo-ir')

    expect(cameraDevice).toBeDefined()

    const sectorPoints = getCameraSectorPoints(cameraDevice!, 35, 70, 4)
    const bearingLine = getDeviceBearingLine(cameraDevice!, 35)

    expect(sectorPoints).toHaveLength(6)
    expect(sectorPoints[0]).toEqual([cameraDevice!.latitude, cameraDevice!.longitude])
    expect(bearingLine).toHaveLength(2)
    expect(bearingLine[0]).toEqual([cameraDevice!.latitude, cameraDevice!.longitude])
    expect(bearingLine[1][0]).toBeGreaterThan(cameraDevice!.latitude)
  })

  it('returns a default center when no devices exist', () => {
    expect(getMapCenter([])).toEqual([41.0082, 28.9784])
  })

  it('places alert overlays on their source device coordinates', () => {
    const overlays = getAlertOverlays(alerts, devices)

    expect(overlays[0]).toEqual({
      alert: alerts[0],
      position: [devices[0].latitude, devices[0].longitude],
      sourceDevice: devices[0],
    })
    expect(overlays).toHaveLength(alerts.length)
  })

  it('skips alert overlays when the source device is not visible', () => {
    const overlays = getAlertOverlays(alerts, [])

    expect(overlays).toEqual([])
  })

  it('selects the highest priority high or critical incident for the sonar focus', () => {
    const overlay = getFeaturedIncidentOverlay(
      [
        {
          id: 'incident-medium',
          confidence: 0.99,
          confirmationLevel: 'multi-sensor',
          createdAt: '2026-07-02T10:00:00.000Z',
          evidenceRefs: [],
          projectId: 'project-001',
          sensorEventIds: ['event-1'],
          severity: 'medium',
          sourceDeviceIds: ['radar-001'],
          status: 'reviewing',
          title: 'Medium incident',
          updatedAt: '2026-07-02T10:00:00.000Z',
        },
        {
          id: 'incident-critical',
          confidence: 0.72,
          confirmationLevel: 'multi-sensor',
          createdAt: '2026-07-02T10:01:00.000Z',
          evidenceRefs: [],
          projectId: 'project-001',
          sensorEventIds: ['event-2'],
          severity: 'critical',
          sourceDeviceIds: ['radar-001', 'rf-002'],
          status: 'reviewing',
          title: 'Critical incident',
          updatedAt: '2026-07-02T10:01:00.000Z',
        },
        {
          id: 'incident-high',
          confidence: 0.95,
          confirmationLevel: 'single-sensor',
          createdAt: '2026-07-02T10:02:00.000Z',
          evidenceRefs: [],
          projectId: 'project-001',
          sensorEventIds: ['event-3'],
          severity: 'high',
          sourceDeviceIds: ['eo-003'],
          status: 'open',
          title: 'High incident',
          updatedAt: '2026-07-02T10:02:00.000Z',
        },
      ],
      devices,
    )

    expect(overlay?.incident.id).toBe('incident-critical')
    expect(overlay?.position[0]).toBeCloseTo((devices[0].latitude + devices[1].latitude) / 2)
    expect(overlay?.position[1]).toBeCloseTo((devices[0].longitude + devices[1].longitude) / 2)
  })
})
