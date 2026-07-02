import type { ProjectDraftInput } from '../services/mockDashboardService'

const projectStatuses = ['draft', 'survey', 'active'] as const

export type ProjectSaveInputResult =
  | { ok: true; value: ProjectDraftInput }
  | { ok: false; message: string }

export function parseProjectSaveInput(body: unknown): ProjectSaveInputResult {
  if (!isRecord(body)) {
    return { ok: false, message: 'Project payload is required.' }
  }

  const name = getStringField(body, 'name')
  const customer = getStringField(body, 'customer')
  const site = getStringField(body, 'site')
  const status = getStringField(body, 'status')

  if (name.trim().length === 0) {
    return { ok: false, message: 'Project name is required.' }
  }

  if (customer.trim().length === 0) {
    return { ok: false, message: 'Customer is required.' }
  }

  if (site.trim().length > 80) {
    return { ok: false, message: 'Site must be 80 characters or fewer.' }
  }

  if (!projectStatuses.includes(status as ProjectDraftInput['status'])) {
    return { ok: false, message: 'Project status is invalid.' }
  }

  return {
    ok: true,
    value: {
      name,
      customer,
      site,
      status: status as ProjectDraftInput['status'],
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
