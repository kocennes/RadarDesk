import { describe, expect, it } from 'vitest'
import { sensorEvents } from '../../mocks/sensorEvents'
import type { SensorEvent } from '../../types/domain'
import { getRadarPpiTargets } from './radarPpiTargets'

describe('getRadarPpiTargets', () => {
  it('normalizes mock radar-track events into drawable PPI targets', () => {
    expect(getRadarPpiTargets(sensorEvents)).toEqual([
      {
        id: 'event-radar-001',
        bearingDeg: 18,
        rangeM: 420,
        severity: 'medium',
        speedMps: 7,
        trackId: 'T-104',
      },
    ])
  })

  it('skips non-radar events and out-of-range tracks', () => {
    const events: SensorEvent[] = [
      ...sensorEvents,
      {
        id: 'event-radar-far',
        detectedAt: '2026-07-02T10:40:00.000Z',
        deviceId: 'radar-001',
        kind: 'radar-track',
        metadata: {
          bearingDeg: -20,
          rangeM: 1500,
        },
        severity: 'high',
      },
    ]

    expect(getRadarPpiTargets(events, 1000).map((target) => target.id)).toEqual(['event-radar-001'])
  })
})
