export interface RadarTrackEvent {
  device_id: string
  model_no: string
  protocol: 'ASTERIX_CAT048'
  target_id: string
  timestamp: string
  latitude: number
  longitude: number
  altitude_meters: number
  velocity_mps: number
  heading_degrees: number
  rcs_dbsm: number
}

export interface SIGINTDetectionEvent {
  device_id: string
  model_no: string
  protocol: 'TCP_RAW_STREAM'
  center_frequency_mhz: number
  bandwidth_mhz: number
  signal_strength_dbm: number
  modulation_type: string
  duration_seconds: number
  direction_of_arrival_deg: number
}

export interface CameraEvidenceEvent {
  device_id: string
  model_no: string
  protocol: 'RTSP_H264'
  fov_horizontal_deg: number
  imaging_mode: 'DAYLIGHT' | 'THERMAL_IR'
  threat_classification: 'DRONE' | 'HUMAN_INTRUSION' | 'MILITARY_VEHICLE' | 'SUSPICIOUS_CIVILIAN'
  confidence_score: number
  detected_plate?: string
  evidence_snapshot_mock_url: string
  start_time: string
}

export type DashboardState = 'success' | 'loading' | 'error' | 'empty'
export type Severity = 'low' | 'medium' | 'high' | 'critical'
export type IngestKind = 'thermal' | 'radar' | 'rf' | 'c2'
export type TabKey = 'alerts' | 'incidents'
export type DeviceStatus = 'online' | 'warning' | 'alarm' | 'offline'

export interface DeviceListRow {
  id: string
  name: string
  model_no: string
  protocol: RadarTrackEvent['protocol'] | SIGINTDetectionEvent['protocol'] | CameraEvidenceEvent['protocol'] | 'HTTPS_SSE'
  active_frequency: string
  status: DeviceStatus
  started_at: string
}

export interface NormalizedSensorEvent {
  id: string
  source_type: IngestKind
  device_id: string
  protocol: string
  timestamp: string
  payload_summary: string
  severity: Severity
}

export interface AlarmLog {
  id: string
  title: string
  source: string
  timestamp: string
  severity: Severity
}

export interface IncidentFolder {
  id: string
  title: string
  confidence: number
  severity: Severity
  status: 'open' | 'reviewing' | 'confirmed'
  operator_note: string
}

export interface CameraCommandMetadata {
  command_id: string
  command_type: 'ptz_slew_to_track'
  dry_run: true
  requested_at: string
  target_id: string
  device_id: string
  trigger_source: 'operator' | 'auto-correlation'
}

export interface SlewToCueState {
  status: 'idle' | 'suggested' | 'tracking' | 'verified'
  reason: string
  target_id?: string
  updated_at: string
}

export interface SiteOrigin {
  latitude: number
  longitude: number
}

export type C2IngestPacket =
  | {
      kind: 'radar'
      payload: RadarTrackEvent
    }
  | {
      kind: 'rf'
      payload: SIGINTDetectionEvent
    }
  | {
      kind: 'thermal'
      payload: CameraEvidenceEvent
    }
  | {
      kind: 'c2'
      payload: NormalizedSensorEvent
    }
