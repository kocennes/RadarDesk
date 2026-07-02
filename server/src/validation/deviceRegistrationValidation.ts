import type { RegisterDeviceInput } from '../services/mockDashboardService'

export function parseRegisterDeviceInput(
  body: unknown,
): { ok: true; value: RegisterDeviceInput } | { ok: false; message: string } {
  if (!isRecord(body)) {
    return { ok: false, message: 'Device registration payload is required.' }
  }

  const discoveredDeviceId = getStringField(body, 'discoveredDeviceId')
  const displayName = getStringField(body, 'displayName')

  if (!discoveredDeviceId) {
    return { ok: false, message: 'Discovered device is required.' }
  }

  if (displayName.trim().length < 2) {
    return { ok: false, message: 'Device name must be at least 2 characters.' }
  }

  if (displayName.trim().length > 60) {
    return { ok: false, message: 'Device name must be 60 characters or fewer.' }
  }

  return {
    ok: true,
    value: {
      discoveredDeviceId,
      displayName,
    },
  }
}

function getStringField(record: Record<string, unknown>, field: string): string {
  const value = record[field]

  return typeof value === 'string' ? value : ''
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
