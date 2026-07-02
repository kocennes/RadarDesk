import type { SensorEvent } from '../types/domain'

export const sensorEvents: SensorEvent[] = [
  {
    id: 'event-thermal-001',
    deviceId: 'eo-003',
    kind: 'thermal-motion',
    severity: 'high',
    detectedAt: '2026-07-02T10:32:00.000Z',
    metadata: {
      area: 'Mock bahce bolgesi',
      confidence: 0.82,
      pipeline: 'thermal-frame-pipeline',
    },
    evidence: {
      hash: 'mock-thermal-hash-001',
      snapshotPath: 'local/evidence/event-thermal-001.jpg',
    },
  },
  {
    id: 'event-radar-001',
    deviceId: 'radar-001',
    kind: 'radar-track',
    severity: 'medium',
    detectedAt: '2026-07-02T10:35:00.000Z',
    metadata: {
      bearingDeg: 18,
      rangeM: 420,
      speedMps: 7,
      trackId: 'T-104',
    },
    evidence: {
      dataPath: 'local/evidence/event-radar-001.json',
      hash: 'mock-radar-hash-001',
    },
  },
  {
    id: 'event-rf-001',
    deviceId: 'rf-002',
    kind: 'rf-signal',
    severity: 'medium',
    detectedAt: '2026-07-02T10:36:00.000Z',
    metadata: {
      band: 'training-band',
      durationSec: 4,
      frequencyMhz: 2450,
      signalDbm: -54,
    },
    evidence: {
      dataPath: 'local/evidence/event-rf-001.json',
      hash: 'mock-rf-hash-001',
    },
  },
]
