import type { CommandType } from '../../../src/types/domain'

export type CommandRequestInput = {
  commandType: CommandType
  deviceId: string
  incidentId?: string
  reason?: string
  targetId?: string
}

const commandTypes: CommandType[] = [
  'camera-preset',
  'cancel',
  'capture-evidence',
  'countermeasure-request',
  'ptz-slew',
]

const maxReasonLength = 240

export function parseCommandRequestInput(
  body: unknown,
): { ok: true; value: CommandRequestInput } | { ok: false; message: string } {
  if (!isRecord(body)) {
    return { ok: false, message: 'Command payload is required.' }
  }

  const commandType = getStringField(body, 'commandType')
  const deviceId = getStringField(body, 'deviceId')
  const incidentId = getStringField(body, 'incidentId')
  const reason = getStringField(body, 'reason')
  const targetId = getStringField(body, 'targetId')

  if (!commandTypes.includes(commandType as CommandType)) {
    return { ok: false, message: 'Command type is invalid.' }
  }

  if (!deviceId) {
    return { ok: false, message: 'Command device id is required.' }
  }

  if (reason.length > maxReasonLength) {
    return { ok: false, message: 'Command reason must be 240 characters or fewer.' }
  }

  return {
    ok: true,
    value: {
      commandType: commandType as CommandType,
      deviceId,
      incidentId: incidentId || undefined,
      reason: reason || undefined,
      targetId: targetId || undefined,
    },
  }
}

function getStringField(record: Record<string, unknown>, field: string): string {
  const value = record[field]

  return typeof value === 'string' ? value.trim() : ''
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
