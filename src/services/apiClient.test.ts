import { afterEach, describe, expect, it, vi } from 'vitest'
import { alerts } from '../mocks/alerts'
import { devices } from '../mocks/devices'
import { projects } from '../mocks/projects'
import { fetchDashboardData, saveProjectDraft } from './apiClient'

describe('apiClient', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('falls back to safe mock data when no API base URL is configured', async () => {
    const dashboardData = await fetchDashboardData('')

    expect(dashboardData.devices).toHaveLength(devices.length)
    expect(dashboardData.alerts).toHaveLength(alerts.length)
    expect(dashboardData.projects).toHaveLength(projects.length)
  })

  it('loads dashboard lists from the configured API base URL', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = String(input)

      if (url.endsWith('/api/devices')) {
        return jsonResponse({ data: devices })
      }

      if (url.endsWith('/api/alerts')) {
        return jsonResponse({ data: alerts })
      }

      if (url.endsWith('/api/projects')) {
        return jsonResponse({ data: projects })
      }

      return jsonResponse({ data: [] }, false)
    })

    const dashboardData = await fetchDashboardData('http://localhost:4000')

    expect(fetchMock).toHaveBeenCalledTimes(3)
    expect(dashboardData.devices).toHaveLength(devices.length)
    expect(dashboardData.alerts).toHaveLength(alerts.length)
    expect(dashboardData.projects).toHaveLength(projects.length)
  })

  it('posts project drafts to the configured API base URL', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      jsonResponse({
        data: {
          id: 'project-draft-local',
          name: 'Field Survey',
          customer: 'Training Customer',
          site: 'Demo Site',
          status: 'draft',
        },
      }),
    )

    const savedProject = await saveProjectDraft(
      {
        name: 'Field Survey',
        customer: 'Training Customer',
        site: 'Demo Site',
        status: 'draft',
      },
      'http://localhost:4000',
    )

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:4000/api/projects',
      expect.objectContaining({
        method: 'POST',
      }),
    )
    expect(savedProject.name).toBe('Field Survey')
  })

  it('saves project drafts with the mock fallback when no API base URL is configured', async () => {
    const savedProject = await saveProjectDraft(
      {
        name: '  Field Survey  ',
        customer: '  Training Customer  ',
        site: '  Demo Site  ',
        status: 'draft',
      },
      '',
    )

    expect(savedProject).toEqual({
      id: 'project-draft-local',
      name: 'Field Survey',
      customer: 'Training Customer',
      site: 'Demo Site',
      status: 'draft',
    })
  })

  it('throws a safe error when the API request fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ error: { code: 'bad', message: 'Bad' } }, false))

    await expect(fetchDashboardData('http://localhost:4000')).rejects.toThrow('API request failed.')
  })
})

function jsonResponse(body: unknown, ok = true): Response {
  return {
    json: async () => body,
    ok,
  } as Response
}
