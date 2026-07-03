import { describe, expect, it, vi } from 'vitest'
import {
  buildSlewToCueSuggestion,
  createAlarmLogs,
  normalizeCameraEvidence,
  normalizeRadarTrack,
  severityFromCamera,
  severityFromRadarTrack,
  severityFromSigint,
} from './c2Ingestion'
import type { CameraEvidenceEvent, RadarTrackEvent, SIGINTDetectionEvent } from './c2Types'

const radarBase: RadarTrackEvent = {
  altitude_meters: 140,
  device_id: 'BIS-RAD-01',
  heading_degrees: 60,
  latitude: 39.93,
  longitude: 32.86,
  model_no: 'BIS-RAD-200X',
  protocol: 'ASTERIX_CAT048',
  rcs_dbsm: -13,
  target_id: 'TRK-TEST',
  timestamp: '2026-07-03T12:00:00.000Z',
  velocity_mps: 22,
}

const sigintBase: SIGINTDetectionEvent = {
  bandwidth_mhz: 20,
  center_frequency_mhz: 2412,
  device_id: 'BIS-RF-04',
  direction_of_arrival_deg: 72,
  duration_seconds: 18,
  model_no: 'BIS-SIGINT-V3',
  modulation_type: 'OFDM',
  protocol: 'TCP_RAW_STREAM',
  signal_strength_dbm: -64,
}

const cameraBase: CameraEvidenceEvent = {
  confidence_score: 0.86,
  device_id: 'BIS-CAM-02',
  evidence_snapshot_mock_url: '/mock/evidence/test.jpg',
  fov_horizontal_deg: 42,
  imaging_mode: 'THERMAL_IR',
  model_no: 'BIS-THERMAL-PTZ',
  protocol: 'RTSP_H264',
  start_time: '2026-07-03T12:00:04.000Z',
  threat_classification: 'DRONE',
}

describe('c2 ingestion pipeline', () => {
  it('classifies radar, RF, and camera severity from typed packets', () => {
    expect(severityFromRadarTrack(radarBase)).toBe('critical')
    expect(severityFromRadarTrack({ ...radarBase, rcs_dbsm: -20, velocity_mps: 16 })).toBe('high')
    expect(severityFromRadarTrack({ ...radarBase, rcs_dbsm: -20, velocity_mps: 9 })).toBe('medium')

    expect(severityFromSigint(sigintBase)).toBe('high')
    expect(severityFromSigint({ ...sigintBase, duration_seconds: 9, signal_strength_dbm: -66 })).toBe('medium')
    expect(severityFromSigint({ ...sigintBase, duration_seconds: 4, signal_strength_dbm: -82 })).toBe('low')

    expect(severityFromCamera(cameraBase)).toBe('critical')
    expect(severityFromCamera({ ...cameraBase, confidence_score: 0.76, threat_classification: 'HUMAN_INTRUSION' })).toBe('high')
    expect(severityFromCamera({ ...cameraBase, confidence_score: 0.64, threat_classification: 'HUMAN_INTRUSION' })).toBe('medium')
  })

  it('normalizes radar and camera packets into UI-safe event envelopes', () => {
    expect(normalizeRadarTrack(radarBase)).toMatchObject({
      device_id: 'BIS-RAD-01',
      id: 'EVT-TRK-TEST',
      protocol: 'ASTERIX_CAT048',
      severity: 'critical',
      source_type: 'radar',
      timestamp: radarBase.timestamp,
    })

    expect(normalizeCameraEvidence(cameraBase)).toMatchObject({
      device_id: 'BIS-CAM-02',
      protocol: 'RTSP_H264',
      severity: 'critical',
      source_type: 'thermal',
      timestamp: cameraBase.start_time,
    })
  })

  it('creates chronological alarm logs from multiple sensor families', () => {
    vi.setSystemTime(new Date('2026-07-03T12:00:05.000Z'))

    const alarms = createAlarmLogs([radarBase], [sigintBase], [cameraBase])

    expect(alarms).toHaveLength(3)
    expect(alarms[0]?.timestamp).toBe('2026-07-03T12:00:05.000Z')
    expect(alarms.map((alarm) => alarm.source)).toEqual([
      'BIS-RF-04 / 2412.0MHz',
      'BIS-CAM-02 / THERMAL_IR',
      'BIS-RAD-01 / ASTERIX_CAT048',
    ])

    vi.useRealTimers()
  })

  it('builds a dry-run slew-to-cue command from correlated radar and RF detections', () => {
    const suggestion = buildSlewToCueSuggestion([radarBase], [sigintBase], undefined)

    expect(suggestion?.command).toMatchObject({
      command_type: 'ptz_slew_to_track',
      dry_run: true,
      target_id: 'TRK-TEST',
      trigger_source: 'auto-correlation',
    })
    expect(suggestion?.state).toMatchObject({
      status: 'tracking',
      target_id: 'TRK-TEST',
    })
  })

  it('marks slew-to-cue as verified when camera AI evidence confirms the target', () => {
    const suggestion = buildSlewToCueSuggestion([radarBase], [sigintBase], cameraBase)

    expect(suggestion?.state.status).toBe('verified')
    expect(suggestion?.state.reason).toContain('DRONE')
  })

  it('does not suggest camera movement when there is no tactical radar or RF support', () => {
    const lowRadar = { ...radarBase, rcs_dbsm: -22, velocity_mps: 8 }

    expect(buildSlewToCueSuggestion([lowRadar], [], undefined)).toBeUndefined()
  })
})
