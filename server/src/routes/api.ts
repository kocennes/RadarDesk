import { Router } from 'express'
import {
  getMockAlerts,
  getMockDevices,
  getMockProjects,
  saveMockProjectDraft,
  type ProjectSaveInput,
} from '../../../src/services/mockApi'

const projectStatuses = ['draft', 'survey', 'active'] as const

export const apiRouter = Router()

apiRouter.get('/api/devices', (_request, response) => {
  response.json({ data: getMockDevices() })
})

apiRouter.get('/api/alerts', (_request, response) => {
  response.json({ data: getMockAlerts() })
})

apiRouter.get('/api/projects', (_request, response) => {
  response.json({ data: getMockProjects() })
})

apiRouter.post('/api/projects', (request, response) => {
  const projectInput = parseProjectSaveInput(request.body)

  if (!projectInput.ok) {
    response.status(400).json({
      error: {
        code: 'invalid_project',
        message: projectInput.message,
      },
    })
    return
  }

  response.status(201).json({ data: saveMockProjectDraft(projectInput.value) })
})

function parseProjectSaveInput(body: unknown): { ok: true; value: ProjectSaveInput } | { ok: false; message: string } {
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

  if (!projectStatuses.includes(status as ProjectSaveInput['status'])) {
    return { ok: false, message: 'Project status is invalid.' }
  }

  return {
    ok: true,
    value: {
      name,
      customer,
      site,
      status: status as ProjectSaveInput['status'],
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
