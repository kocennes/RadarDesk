import type {
  CameraEvidenceEvent,
  DeviceListRow,
  IncidentFolder,
  RadarTrackEvent,
  Severity,
  SIGINTDetectionEvent,
  SiteOrigin,
} from './c2Types'

export const siteOrigin: SiteOrigin = {
  latitude: 39.9334,
  longitude: 32.8597,
}

export const initialRadarTracks: RadarTrackEvent[] = [
  createRadarTrackEvent({ heading_degrees: 42, latitudeOffset: 0.0032, longitudeOffset: 0.0048, rcs_dbsm: -13.4, target_id: 'TRK-9042', velocity_mps: 24 }),
  createRadarTrackEvent({ heading_degrees: 316, latitudeOffset: -0.0028, longitudeOffset: 0.0029, rcs_dbsm: -18.2, target_id: 'TRK-1447', velocity_mps: 12 }),
  createRadarTrackEvent({ heading_degrees: 81, latitudeOffset: 0.0012, longitudeOffset: -0.0041, rcs_dbsm: -9.8, target_id: 'TRK-3881', velocity_mps: 18 }),
]

export const initialSigintEvents: SIGINTDetectionEvent[] = [
  createSigintEvent({ center_frequency_mhz: 2412, direction_of_arrival_deg: 58, duration_seconds: 18, modulation_type: 'OFDM', signal_strength_dbm: -61 }),
  createSigintEvent({ center_frequency_mhz: 5805, direction_of_arrival_deg: 284, duration_seconds: 9, modulation_type: 'FHSS', signal_strength_dbm: -68 }),
  createSigintEvent({ center_frequency_mhz: 915, direction_of_arrival_deg: 132, duration_seconds: 6, modulation_type: 'FSK', signal_strength_dbm: -76 }),
]

export const initialCameraEvidences: CameraEvidenceEvent[] = [
  createCameraEvidenceEvent({
    confidence_score: 0.86,
    evidence_snapshot_mock_url: '/mock/evidence/thermal-drone-001.jpg',
    fov_horizontal_deg: 42,
    imaging_mode: 'THERMAL_IR',
    threat_classification: 'DRONE',
  }),
  createCameraEvidenceEvent({
    confidence_score: 0.72,
    detected_plate: '06 BIS 042',
    evidence_snapshot_mock_url: '/mock/evidence/anpr-vehicle-017.jpg',
    fov_horizontal_deg: 54,
    imaging_mode: 'DAYLIGHT',
    threat_classification: 'SUSPICIOUS_CIVILIAN',
  }),
]

export const initialDevices: DeviceListRow[] = [
  deviceRow('BIS-RAD-01', 'Kuzey Radar', 'BIS-RAD-200X', 'ASTERIX_CAT048', 'N/A', 'online', 236),
  deviceRow('BIS-RF-04', 'Dogu SIGINT Node', 'BIS-SIGINT-V3', 'TCP_RAW_STREAM', '2412 MHz', 'warning', 128),
  deviceRow('BIS-CAM-02', 'Termal PTZ', 'BIS-THERMAL-PTZ', 'RTSP_H264', 'N/A', 'online', 92),
  deviceRow('BIS-LPR-02', 'Plaka Okuma', 'BIS-ANPR-CIV', 'RTSP_H264', 'N/A', 'online', 421),
  deviceRow('BIS-C2-01', 'NEXUS Gateway', 'NEXUS-C2-GW', 'HTTPS_SSE', 'N/A', 'online', 517),
  deviceRow('BIS-RF-09', 'Mobil RF Node', 'BIS-SIGINT-L', 'TCP_RAW_STREAM', '5805 MHz', 'offline', 31),
]

export const initialIncidents: IncidentFolder[] = [
  incident('INC-2407-A', 'Radar + RF ile coklu sensor IHA adayi', 88, 'critical', 'reviewing', 'ASTERIX track ve RF DOA ayni sektor penceresinde.'),
  incident('INC-2407-B', 'EO/IR termal dogrulama bekliyor', 71, 'high', 'open', 'Kamera hedef bolgeye yonlendirildi, gorus kosulu izleniyor.'),
  incident('INC-2407-C', 'Sivil plaka okuma uyarisi', 54, 'low', 'open', 'ANPR alarmi sivil guvenlik prosedurune aktarilacak.'),
  incident('INC-2407-D', 'Tek sensor RF anomalisi', 62, 'medium', 'open', 'Kisa sureli FHSS aktivitesi, tekrar gozlem gerekiyor.'),
]

export function createRadarTrackEvent(overrides: Partial<RadarTrackEvent> & { latitudeOffset?: number; longitudeOffset?: number } = {}): RadarTrackEvent {
  const latitudeOffset = overrides.latitudeOffset ?? (randomInt(80) - 40) / 10000
  const longitudeOffset = overrides.longitudeOffset ?? (randomInt(80) - 40) / 10000

  return {
    altitude_meters: overrides.altitude_meters ?? 80 + randomInt(180),
    device_id: overrides.device_id ?? 'BIS-RAD-01',
    heading_degrees: overrides.heading_degrees ?? randomInt(360),
    latitude: overrides.latitude ?? siteOrigin.latitude + latitudeOffset,
    longitude: overrides.longitude ?? siteOrigin.longitude + longitudeOffset,
    model_no: overrides.model_no ?? 'BIS-RAD-200X',
    protocol: 'ASTERIX_CAT048',
    rcs_dbsm: overrides.rcs_dbsm ?? -22 + randomInt(17),
    target_id: overrides.target_id ?? `TRK-${1000 + randomInt(8999)}`,
    timestamp: overrides.timestamp ?? new Date().toISOString(),
    velocity_mps: overrides.velocity_mps ?? 8 + randomInt(26),
  }
}

export function createSigintEvent(overrides: Partial<SIGINTDetectionEvent> = {}): SIGINTDetectionEvent {
  return {
    bandwidth_mhz: overrides.bandwidth_mhz ?? 20,
    center_frequency_mhz: overrides.center_frequency_mhz ?? (randomInt(2) === 0 ? 2412 + randomInt(72) : 5725 + randomInt(160)),
    device_id: overrides.device_id ?? 'BIS-RF-04',
    direction_of_arrival_deg: overrides.direction_of_arrival_deg ?? randomInt(360),
    duration_seconds: overrides.duration_seconds ?? 4 + randomInt(24),
    model_no: overrides.model_no ?? 'BIS-SIGINT-V3',
    modulation_type: overrides.modulation_type ?? (randomInt(2) === 0 ? 'OFDM' : 'FHSS'),
    protocol: 'TCP_RAW_STREAM',
    signal_strength_dbm: overrides.signal_strength_dbm ?? -52 - randomInt(32),
  }
}

export function createCameraEvidenceEvent(overrides: Partial<CameraEvidenceEvent> = {}): CameraEvidenceEvent {
  const isCivil = overrides.threat_classification === 'SUSPICIOUS_CIVILIAN'

  return {
    confidence_score: overrides.confidence_score ?? Number((0.68 + Math.random() * 0.27).toFixed(2)),
    detected_plate: overrides.detected_plate ?? (isCivil ? `06 BIS ${100 + randomInt(899)}` : undefined),
    device_id: overrides.device_id ?? 'BIS-CAM-02',
    evidence_snapshot_mock_url: overrides.evidence_snapshot_mock_url ?? `/mock/evidence/capture-${Date.now()}.jpg`,
    fov_horizontal_deg: overrides.fov_horizontal_deg ?? (overrides.imaging_mode === 'DAYLIGHT' ? 54 : 42),
    imaging_mode: overrides.imaging_mode ?? (randomInt(2) === 0 ? 'THERMAL_IR' : 'DAYLIGHT'),
    model_no: overrides.model_no ?? 'BIS-THERMAL-PTZ',
    protocol: 'RTSP_H264',
    start_time: overrides.start_time ?? new Date().toISOString(),
    threat_classification: overrides.threat_classification ?? (randomInt(2) === 0 ? 'DRONE' : 'HUMAN_INTRUSION'),
  }
}

function deviceRow(
  id: string,
  name: string,
  model_no: string,
  protocol: DeviceListRow['protocol'],
  active_frequency: string,
  status: DeviceListRow['status'],
  ageMinutes: number,
): DeviceListRow {
  return {
    active_frequency,
    id,
    model_no,
    name,
    protocol,
    started_at: minutesAgo(ageMinutes),
    status,
  }
}

function incident(
  id: string,
  title: string,
  confidence: number,
  severity: Severity,
  status: IncidentFolder['status'],
  operator_note: string,
): IncidentFolder {
  return { confidence, id, operator_note, severity, status, title }
}

function minutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60000).toISOString()
}

function randomInt(max: number): number {
  return Math.floor(Math.random() * max)
}
