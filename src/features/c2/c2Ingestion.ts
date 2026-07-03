import type {
  AlarmLog,
  CameraCommandMetadata,
  CameraEvidenceEvent,
  NormalizedSensorEvent,
  RadarTrackEvent,
  Severity,
  SIGINTDetectionEvent,
  SlewToCueState,
} from './c2Types'

export function normalizeInitialEvents(
  radarTracks: RadarTrackEvent[],
  sigintEvents: SIGINTDetectionEvent[],
  cameraEvidences: CameraEvidenceEvent[],
): NormalizedSensorEvent[] {
  return [
    ...radarTracks.map(normalizeRadarTrack),
    ...sigintEvents.map(normalizeSigint),
    ...cameraEvidences.map(normalizeCameraEvidence),
  ].sort((left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime())
}

export function normalizeRadarTrack(event: RadarTrackEvent): NormalizedSensorEvent {
  return {
    device_id: event.device_id,
    id: `EVT-${event.target_id}`,
    payload_summary: `ASTERIX target=${event.target_id} vel=${event.velocity_mps}m/s hdg=${event.heading_degrees} rcs=${event.rcs_dbsm}dBsm`,
    protocol: event.protocol,
    severity: severityFromRadarTrack(event),
    source_type: 'radar',
    timestamp: event.timestamp,
  }
}

export function normalizeSigint(event: SIGINTDetectionEvent): NormalizedSensorEvent {
  const timestamp = new Date().toISOString()

  return {
    device_id: event.device_id,
    id: `EVT-SIG-${timestamp}`,
    payload_summary: `${event.modulation_type} ${event.center_frequency_mhz}MHz bw=${event.bandwidth_mhz}MHz rssi=${event.signal_strength_dbm}dBm doa=${event.direction_of_arrival_deg}deg`,
    protocol: event.protocol,
    severity: severityFromSigint(event),
    source_type: 'rf',
    timestamp,
  }
}

export function normalizeCameraEvidence(event: CameraEvidenceEvent): NormalizedSensorEvent {
  return {
    device_id: event.device_id,
    id: `EVT-CAM-${event.start_time}`,
    payload_summary: `${event.imaging_mode} ${event.threat_classification} conf=${event.confidence_score.toFixed(2)}${event.detected_plate ? ` plate=${event.detected_plate}` : ''}`,
    protocol: event.protocol,
    severity: severityFromCamera(event),
    source_type: 'thermal',
    timestamp: event.start_time,
  }
}

export function createAlarmLogs(
  radarTracks: RadarTrackEvent[],
  sigintEvents: SIGINTDetectionEvent[],
  cameraEvidences: CameraEvidenceEvent[],
): AlarmLog[] {
  return [
    ...radarTracks.map(alarmFromRadarTrack),
    ...sigintEvents.map(alarmFromSigint),
    ...cameraEvidences.map(alarmFromCameraEvidence),
  ].sort((left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime())
}

export function alarmFromRadarTrack(event: RadarTrackEvent): AlarmLog {
  return {
    id: `ALR-${event.target_id}`,
    severity: severityFromRadarTrack(event),
    source: `${event.device_id} / ${event.protocol}`,
    timestamp: event.timestamp,
    title: `Radar track ${event.target_id}`,
  }
}

export function alarmFromSigint(event: SIGINTDetectionEvent): AlarmLog {
  return {
    id: `ALR-SIG-${Date.now().toString().slice(-6)}`,
    severity: severityFromSigint(event),
    source: `${event.device_id} / ${event.center_frequency_mhz.toFixed(1)}MHz`,
    timestamp: new Date().toISOString(),
    title: `${event.modulation_type} RF detection`,
  }
}

export function alarmFromCameraEvidence(event: CameraEvidenceEvent): AlarmLog {
  return {
    id: `ALR-CAM-${Date.now().toString().slice(-6)}`,
    severity: severityFromCamera(event),
    source: `${event.device_id} / ${event.imaging_mode}`,
    timestamp: event.start_time,
    title: `${event.threat_classification} camera evidence`,
  }
}

export function buildSlewToCueSuggestion(
  radarTracks: RadarTrackEvent[],
  sigintEvents: SIGINTDetectionEvent[],
  cameraEvidence: CameraEvidenceEvent | undefined,
): { command: CameraCommandMetadata; state: SlewToCueState } | undefined {
  const tacticalTrack = radarTracks.find((track) => severityFromRadarTrack(track) === 'critical' || severityFromRadarTrack(track) === 'high')
  const supportingRf = tacticalTrack
    ? sigintEvents.find((event) => Math.abs(event.direction_of_arrival_deg - tacticalTrack.heading_degrees) <= 35)
    : undefined

  if (!tacticalTrack && !supportingRf) {
    return undefined
  }

  const targetId = tacticalTrack?.target_id ?? `RF-${supportingRf?.center_frequency_mhz.toFixed(0) ?? 'LOCAL'}`
  const hasAiVerification =
    cameraEvidence !== undefined &&
    cameraEvidence.confidence_score >= 0.78 &&
    (cameraEvidence.threat_classification === 'DRONE' || cameraEvidence.threat_classification === 'MILITARY_VEHICLE')
  const status: SlewToCueState['status'] = hasAiVerification ? 'verified' : supportingRf ? 'tracking' : 'suggested'
  const reason = hasAiVerification
    ? `Kamera AI ${cameraEvidence?.threat_classification} sinifini ${Math.round((cameraEvidence?.confidence_score ?? 0) * 100)}% guvenle dogruladi.`
    : supportingRf
      ? `Radar izi RF DOA ile desteklendi; kamera ${targetId} hedefine dry-run yonlendirme modunda.`
      : `Radar tehdidi ${targetId} icin kamera yonlendirme onerisi uretti.`

  return {
    command: {
      command_id: `AUTO-${targetId}`,
      command_type: 'ptz_slew_to_track',
      device_id: cameraEvidence?.device_id ?? 'BIS-CAM-02',
      dry_run: true,
      requested_at: new Date().toISOString(),
      target_id: targetId,
      trigger_source: 'auto-correlation',
    },
    state: {
      reason,
      status,
      target_id: targetId,
      updated_at: new Date().toISOString(),
    },
  }
}

export function severityFromRadarTrack(event: RadarTrackEvent): Severity {
  if (event.velocity_mps >= 20 || event.rcs_dbsm > -12) {
    return 'critical'
  }

  if (event.velocity_mps >= 14) {
    return 'high'
  }

  return 'medium'
}

export function severityFromSigint(event: SIGINTDetectionEvent): Severity {
  if (event.signal_strength_dbm >= -58 || event.duration_seconds >= 18) {
    return 'high'
  }

  if (event.signal_strength_dbm >= -72) {
    return 'medium'
  }

  return 'low'
}

export function severityFromCamera(event: CameraEvidenceEvent): Severity {
  if (event.threat_classification === 'DRONE' && event.confidence_score >= 0.82) {
    return 'critical'
  }

  if (event.confidence_score >= 0.72) {
    return 'high'
  }

  return 'medium'
}
