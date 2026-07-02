import { sensorEvents as seedSensorEvents } from '../../../src/mocks/sensorEvents'
import type { AlertSeverity, LocalEvidenceRef, SensorEvent, SensorEventKind } from '../../../src/types/domain'
import { captureCameraSnapshot } from './cameraSnapshotService'
import { storeStructuredEvidence } from './localEvidenceService'

export type SensorEventInput = {
  cameraFeedId?: string
  deviceId: string
  kind: SensorEventKind
  metadata: Record<string, string | number | boolean>
  severity: AlertSeverity
}

const localSensorEvents: SensorEvent[] = seedSensorEvents.map(cloneSensorEvent)

export function getLocalSensorEvents(): SensorEvent[] {
  return localSensorEvents.map(cloneSensorEvent)
}

export async function ingestLocalSensorEvent(input: SensorEventInput): Promise<SensorEvent> {
  const detectedAt = new Date().toISOString()
  const metadata = {
    ...input.metadata,
    ingest: 'local-backend',
  }
  const id = `event-${input.kind}-${Date.now()}`
  const evidence = isCameraEvidenceEvent(input.kind)
    ? input.cameraFeedId
      ? await captureCameraSnapshot(input.cameraFeedId)
      : undefined
    : await captureStructuredEventEvidence({
        detectedAt,
        deviceId: input.deviceId,
        id,
        kind: input.kind,
        metadata,
        severity: input.severity,
      })

  const event: SensorEvent = {
    id,
    detectedAt,
    deviceId: input.deviceId,
    evidence: evidence
      ? {
          clipPath: evidence.clipPath,
          dataPath: evidence.dataPath,
          hash: evidence.hash,
          snapshotPath: evidence.snapshotPath,
        }
      : undefined,
    kind: input.kind,
    metadata,
    severity: input.severity,
  }

  localSensorEvents.unshift(event)

  return cloneSensorEvent(event)
}

function isCameraEvidenceEvent(kind: SensorEventKind): boolean {
  return kind === 'thermal-motion' || kind === 'camera-motion' || kind === 'camera-object'
}

async function captureStructuredEventEvidence(event: SensorEvent): Promise<LocalEvidenceRef> {
  const content = Buffer.from(`${JSON.stringify(event, null, 2)}\n`, 'utf8')

  return storeStructuredEvidence({
    content,
    contentType: 'application/json',
    extension: 'json',
    feedId: event.deviceId,
  })
}

function cloneSensorEvent(event: SensorEvent): SensorEvent {
  return {
    ...event,
    evidence: event.evidence ? { ...event.evidence } : undefined,
    metadata: { ...event.metadata },
  }
}
