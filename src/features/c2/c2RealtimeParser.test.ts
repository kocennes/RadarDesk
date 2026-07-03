import { describe, expect, it } from 'vitest'
import { parseC2RealtimeEnvelope, parseC2RealtimeMessage } from './c2RealtimeParser'

const radarPayload = {
  altitude_meters: 120,
  device_id: 'BIS-RAD-01',
  heading_degrees: 72,
  latitude: 39.93,
  longitude: 32.86,
  model_no: 'BIS-RAD-200X',
  protocol: 'ASTERIX_CAT048',
  rcs_dbsm: -13,
  target_id: 'TRK-9001',
  timestamp: '2026-07-03T12:00:00.000Z',
  velocity_mps: 22,
}

const rfPayload = {
  bandwidth_mhz: 20,
  center_frequency_mhz: 2412,
  device_id: 'BIS-RF-04',
  direction_of_arrival_deg: 54,
  duration_seconds: 12,
  model_no: 'BIS-SIGINT-V3',
  modulation_type: 'OFDM',
  protocol: 'TCP_RAW_STREAM',
  signal_strength_dbm: -61,
}

const cameraPayload = {
  confidence_score: 0.88,
  device_id: 'BIS-CAM-02',
  evidence_snapshot_mock_url: '/mock/evidence/capture.jpg',
  fov_horizontal_deg: 42,
  imaging_mode: 'THERMAL_IR',
  model_no: 'BIS-THERMAL-PTZ',
  protocol: 'RTSP_H264',
  start_time: '2026-07-03T12:00:04.000Z',
  threat_classification: 'DRONE',
}

describe('c2 realtime parser', () => {
  it('parses valid radar, RF, and camera envelopes', () => {
    expect(parseC2RealtimeEnvelope({ kind: 'radar', payload: radarPayload })).toMatchObject({
      kind: 'radar',
      payload: { protocol: 'ASTERIX_CAT048', target_id: 'TRK-9001' },
    })
    expect(parseC2RealtimeEnvelope({ kind: 'rf', payload: rfPayload })).toMatchObject({
      kind: 'rf',
      payload: { protocol: 'TCP_RAW_STREAM', center_frequency_mhz: 2412 },
    })
    expect(parseC2RealtimeEnvelope({ kind: 'thermal', payload: cameraPayload })).toMatchObject({
      kind: 'thermal',
      payload: { protocol: 'RTSP_H264', threat_classification: 'DRONE' },
    })
  })

  it('parses valid JSON string messages', () => {
    const parsed = parseC2RealtimeMessage(JSON.stringify({ kind: 'radar', payload: radarPayload }))

    expect(parsed?.kind).toBe('radar')
  })

  it('rejects malformed JSON and unknown envelope kinds', () => {
    expect(parseC2RealtimeMessage('{not-json')).toBeUndefined()
    expect(parseC2RealtimeEnvelope({ kind: 'unknown', payload: radarPayload })).toBeUndefined()
  })

  it('rejects payloads with wrong protocols or invalid ranges', () => {
    expect(parseC2RealtimeEnvelope({ kind: 'radar', payload: { ...radarPayload, protocol: 'RAW_VENDOR' } })).toBeUndefined()
    expect(parseC2RealtimeEnvelope({ kind: 'radar', payload: { ...radarPayload, heading_degrees: 420 } })).toBeUndefined()
    expect(parseC2RealtimeEnvelope({ kind: 'thermal', payload: { ...cameraPayload, confidence_score: 1.4 } })).toBeUndefined()
    expect(parseC2RealtimeEnvelope({ kind: 'rf', payload: { ...rfPayload, direction_of_arrival_deg: -1 } })).toBeUndefined()
  })

  it('rejects missing required fields instead of partially trusting payloads', () => {
    const { target_id: _targetId, ...radarWithoutTarget } = radarPayload

    expect(parseC2RealtimeEnvelope({ kind: 'radar', payload: radarWithoutTarget })).toBeUndefined()
  })
})
