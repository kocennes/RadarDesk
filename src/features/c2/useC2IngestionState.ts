import { useEffect, useMemo, useState } from 'react'
import { createDisabledRealtimeAdapter, type C2IngestionAdapter } from './c2IngestionAdapter'
import {
  alarmFromCameraEvidence,
  alarmFromRadarTrack,
  alarmFromSigint,
  buildSlewToCueSuggestion,
  createAlarmLogs,
  normalizeCameraEvidence,
  normalizeInitialEvents,
  normalizeRadarTrack,
  normalizeSigint,
} from './c2Ingestion'
import {
  createCameraEvidenceEvent,
  createRadarTrackEvent,
  createSigintEvent,
  initialCameraEvidences,
  initialDevices,
  initialRadarTracks,
  initialSigintEvents,
} from './c2MockData'
import type {
  AlarmLog,
  C2IngestPacket,
  CameraCommandMetadata,
  CameraEvidenceEvent,
  DashboardState,
  IngestKind,
  NormalizedSensorEvent,
  RadarTrackEvent,
  SIGINTDetectionEvent,
  SlewToCueState,
} from './c2Types'

const disabledRealtimeAdapter = createDisabledRealtimeAdapter()

export function useC2IngestionState(
  dashboardState: DashboardState,
  realtimeAdapter: C2IngestionAdapter = disabledRealtimeAdapter,
) {
  const [radarTracks, setRadarTracks] = useState<RadarTrackEvent[]>(initialRadarTracks)
  const [sigintEvents, setSigintEvents] = useState<SIGINTDetectionEvent[]>(initialSigintEvents)
  const [cameraEvidences, setCameraEvidences] = useState<CameraEvidenceEvent[]>(initialCameraEvidences)
  const [normalizedEvents, setNormalizedEvents] = useState<NormalizedSensorEvent[]>(() =>
    normalizeInitialEvents(initialRadarTracks, initialSigintEvents, initialCameraEvidences),
  )
  const [alarms, setAlarms] = useState<AlarmLog[]>(() => createAlarmLogs(initialRadarTracks, initialSigintEvents, initialCameraEvidences))
  const [cameraCommand, setCameraCommand] = useState<CameraCommandMetadata>()
  const [slewToCueState, setSlewToCueState] = useState<SlewToCueState>(() => ({
    reason: 'Radar/RF korelasyonu bekleniyor.',
    status: 'idle',
    updated_at: new Date().toISOString(),
  }))

  const visibleDevices = dashboardState === 'empty' ? [] : initialDevices
  const latestCameraEvidence = cameraEvidences[0]
  const stats = useMemo(
    () => ({
      activeAlarms: alarms.filter((alarmItem) => alarmItem.severity !== 'low').length,
      criticalThreats: alarms.filter((alarmItem) => alarmItem.severity === 'critical').length,
      onlineDevices: visibleDevices.filter((deviceItem) => deviceItem.status === 'online' || deviceItem.status === 'warning').length,
      totalDevices: visibleDevices.length,
    }),
    [alarms, visibleDevices],
  )

  useEffect(() => {
    const suggestion = buildSlewToCueSuggestion(radarTracks, sigintEvents, latestCameraEvidence)

    if (!suggestion) {
      setSlewToCueState((current) =>
        current.status === 'idle'
          ? current
          : {
              reason: 'Aktif radar/RF korelasyonu bulunamadi.',
              status: 'idle',
              updated_at: new Date().toISOString(),
            },
      )
      return
    }

    setCameraCommand((current) => (current?.target_id === suggestion.command.target_id ? current : suggestion.command))
    setSlewToCueState((current) =>
      current.target_id === suggestion.state.target_id && current.status === suggestion.state.status ? current : suggestion.state,
    )
  }, [latestCameraEvidence, radarTracks, sigintEvents])

  useEffect(() => realtimeAdapter.connect(ingestPacket), [realtimeAdapter])

  function dispatchMockIngest(kind: IngestKind) {
    if (kind === 'radar') {
      ingestPacket({ kind: 'radar', payload: createRadarTrackEvent() })
      return
    }

    if (kind === 'rf') {
      ingestPacket({ kind: 'rf', payload: createSigintEvent() })
      return
    }

    if (kind === 'thermal') {
      ingestPacket({ kind: 'thermal', payload: createCameraEvidenceEvent() })
      return
    }

    ingestPacket({
      kind: 'c2',
      payload: {
        device_id: 'BIS-C2-01',
        id: `EVT-C2-${Date.now().toString().slice(-6)}`,
        payload_summary: 'C2 heartbeat: gateway nominal / local ingestion bus active',
        protocol: 'HTTPS_SSE',
        severity: 'low',
        source_type: 'c2',
        timestamp: new Date().toISOString(),
      },
    })
  }

  function ingestPacket(packet: C2IngestPacket) {
    if (packet.kind === 'radar') {
      setRadarTracks((current) => [packet.payload, ...current].slice(0, 18))
      pushNormalizedEvent(normalizeRadarTrack(packet.payload))
      pushAlarm(alarmFromRadarTrack(packet.payload))
      return
    }

    if (packet.kind === 'rf') {
      setSigintEvents((current) => [packet.payload, ...current].slice(0, 18))
      pushNormalizedEvent(normalizeSigint(packet.payload))
      pushAlarm(alarmFromSigint(packet.payload))
      return
    }

    if (packet.kind === 'thermal') {
      setCameraEvidences((current) => [packet.payload, ...current].slice(0, 12))
      pushNormalizedEvent(normalizeCameraEvidence(packet.payload))
      pushAlarm(alarmFromCameraEvidence(packet.payload))
      return
    }

    pushNormalizedEvent(packet.payload)
  }

  function requestCameraSuggestion() {
    const targetId = radarTracks[0]?.target_id ?? 'TRK-LOCAL'

    setCameraCommand({
      command_id: `CMD-${Date.now().toString().slice(-6)}`,
      command_type: 'ptz_slew_to_track',
      device_id: latestCameraEvidence?.device_id ?? 'BIS-CAM-02',
      dry_run: true,
      requested_at: new Date().toISOString(),
      target_id: targetId,
      trigger_source: 'operator',
    })
    setSlewToCueState({
      reason: 'Operator kamera yonlendirme onerisi olusturdu.',
      status: 'suggested',
      target_id: targetId,
      updated_at: new Date().toISOString(),
    })
  }

  function pushNormalizedEvent(event: NormalizedSensorEvent) {
    setNormalizedEvents((current) => [event, ...current].slice(0, 32))
  }

  function pushAlarm(alarm: AlarmLog) {
    setAlarms((current) => [alarm, ...current].slice(0, 28))
  }

  return {
    alarms,
    cameraCommand,
    dispatchMockIngest,
    ingestPacket,
    latestCameraEvidence,
    normalizedEvents,
    radarTracks,
    requestCameraSuggestion,
    sigintEvents,
    slewToCueState,
    stats,
    visibleDevices,
  }
}
