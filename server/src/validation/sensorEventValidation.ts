import type { AlertSeverity, SensorEventKind } from '../../../src/types/domain'
import type { SensorEventInput } from '../services/localSensorEventService'

const eventKinds: SensorEventKind[] = [
  'camera-motion',
  'camera-object',
  'device-state',
  'radar-track',
  'radar-zone',
  'rf-frequency',
  'rf-signal',
  'thermal-motion',
]

const severities: AlertSeverity[] = ['critical', 'high', 'low', 'medium']

export function parseSensorEventInput(
  body: unknown,
): { ok: true; value: SensorEventInput } | { ok: false; message: string } {
  if (!isRecord(body)) {
    return { ok: false, message: 'Sensor event payload is required.' }
  }

  const deviceId = getStringField(body, 'deviceId')
  const kind = getStringField(body, 'kind')
  const severity = getStringField(body, 'severity')
  const cameraFeedId = getStringField(body, 'cameraFeedId')
  const metadata = parseMetadata(body.metadata)

  if (!deviceId) {
    return { ok: false, message: 'Device id is required.' }
  }

  if (!eventKinds.includes(kind as SensorEventKind)) {
    return { ok: false, message: 'Sensor event kind is invalid.' }
  }

  if (!severities.includes(severity as AlertSeverity)) {
    return { ok: false, message: 'Sensor event severity is invalid.' }
  }

  return {
    ok: true,
    value: {
      cameraFeedId: cameraFeedId || undefined,
      deviceId,
      kind: kind as SensorEventKind,
      metadata,
      severity: severity as AlertSeverity,
    },
  }
}

function parseMetadata(value: unknown): Record<string, string | number | boolean> {
  if (!isRecord(value)) {
    return {}
  }

  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, string | number | boolean] => {
      const [, entryValue] = entry

      return typeof entryValue === 'string' || typeof entryValue === 'number' || typeof entryValue === 'boolean'
    }),
  )
}

function getStringField(record: Record<string, unknown>, field: string): string {
  const value = record[field]

  return typeof value === 'string' ? value.trim() : ''
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
