import type { IncidentStatus } from '../../../src/types/domain'
import type { IncidentReviewInput } from '../services/localIncidentReviewService'

const incidentStatuses: IncidentStatus[] = ['confirmed', 'dismissed', 'open', 'reviewing']
const maxOperatorNoteLength = 240

export function parseIncidentReviewInput(
  body: unknown,
): { ok: true; value: IncidentReviewInput } | { ok: false; message: string } {
  if (!isRecord(body)) {
    return { ok: false, message: 'Incident review payload is required.' }
  }

  const status = getStringField(body, 'status')
  const operatorNote = getStringField(body, 'operatorNote')

  if (!incidentStatuses.includes(status as IncidentStatus)) {
    return { ok: false, message: 'Incident status is invalid.' }
  }

  if (operatorNote.length > maxOperatorNoteLength) {
    return { ok: false, message: 'Operator note must be 240 characters or fewer.' }
  }

  return {
    ok: true,
    value: {
      operatorNote: operatorNote || undefined,
      status: status as IncidentStatus,
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
