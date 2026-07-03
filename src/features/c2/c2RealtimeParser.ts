import type { C2IngestPacket, CameraEvidenceEvent, RadarTrackEvent, SIGINTDetectionEvent } from './c2Types'

type RealtimeEnvelope = {
  kind?: unknown
  payload?: unknown
}

export function parseC2RealtimeMessage(message: string): C2IngestPacket | undefined {
  try {
    return parseC2RealtimeEnvelope(JSON.parse(message))
  } catch {
    return undefined
  }
}

export function parseC2RealtimeEnvelope(value: unknown): C2IngestPacket | undefined {
  if (!isRecord(value)) {
    return undefined
  }

  const envelope = value as RealtimeEnvelope

  if (envelope.kind === 'radar' && isRadarTrackEvent(envelope.payload)) {
    return { kind: 'radar', payload: envelope.payload }
  }

  if (envelope.kind === 'rf' && isSigintDetectionEvent(envelope.payload)) {
    return { kind: 'rf', payload: envelope.payload }
  }

  if (envelope.kind === 'thermal' && isCameraEvidenceEvent(envelope.payload)) {
    return { kind: 'thermal', payload: envelope.payload }
  }

  return undefined
}

function isRadarTrackEvent(value: unknown): value is RadarTrackEvent {
  return (
    isRecord(value) &&
    isString(value.device_id) &&
    isString(value.model_no) &&
    value.protocol === 'ASTERIX_CAT048' &&
    isString(value.target_id) &&
    isIsoDate(value.timestamp) &&
    isFiniteNumber(value.latitude) &&
    isFiniteNumber(value.longitude) &&
    isFiniteNumber(value.altitude_meters) &&
    isFiniteNumber(value.velocity_mps) &&
    isFiniteNumber(value.heading_degrees) &&
    value.heading_degrees >= 0 &&
    value.heading_degrees <= 360 &&
    isFiniteNumber(value.rcs_dbsm)
  )
}

function isSigintDetectionEvent(value: unknown): value is SIGINTDetectionEvent {
  return (
    isRecord(value) &&
    isString(value.device_id) &&
    isString(value.model_no) &&
    value.protocol === 'TCP_RAW_STREAM' &&
    (value.timestamp === undefined || isIsoDate(value.timestamp)) &&
    isFiniteNumber(value.center_frequency_mhz) &&
    isFiniteNumber(value.bandwidth_mhz) &&
    isFiniteNumber(value.signal_strength_dbm) &&
    isString(value.modulation_type) &&
    isFiniteNumber(value.duration_seconds) &&
    isFiniteNumber(value.direction_of_arrival_deg) &&
    value.direction_of_arrival_deg >= 0 &&
    value.direction_of_arrival_deg <= 360
  )
}

function isCameraEvidenceEvent(value: unknown): value is CameraEvidenceEvent {
  return (
    isRecord(value) &&
    isString(value.device_id) &&
    isString(value.model_no) &&
    value.protocol === 'RTSP_H264' &&
    isFiniteNumber(value.fov_horizontal_deg) &&
    (value.imaging_mode === 'DAYLIGHT' || value.imaging_mode === 'THERMAL_IR') &&
    isThreatClassification(value.threat_classification) &&
    isFiniteNumber(value.confidence_score) &&
    value.confidence_score >= 0 &&
    value.confidence_score <= 1 &&
    (value.detected_plate === undefined || isString(value.detected_plate)) &&
    isString(value.evidence_snapshot_mock_url) &&
    isIsoDate(value.start_time)
  )
}

function isThreatClassification(value: unknown): value is CameraEvidenceEvent['threat_classification'] {
  return (
    value === 'DRONE' ||
    value === 'HUMAN_INTRUSION' ||
    value === 'MILITARY_VEHICLE' ||
    value === 'SUSPICIOUS_CIVILIAN'
  )
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isIsoDate(value: unknown): value is string {
  return isString(value) && !Number.isNaN(Date.parse(value))
}
