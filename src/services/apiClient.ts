import type { Alert, Device, Project } from '../types/domain'
import {
  fetchMockDashboardData,
  fetchMockUsers,
  saveMockProjectDraft,
  type MockDashboardData,
  type ProjectSaveInput,
} from './mockApi'

type ApiDataResponse<T> = {
  data: T
}

export async function fetchDashboardData(apiBaseUrl = getApiBaseUrl()): Promise<MockDashboardData> {
  if (!apiBaseUrl) {
    return fetchMockDashboardData()
  }

  const [devices, alerts, projects, users] = await Promise.all([
    fetchApiData<Device[]>(apiBaseUrl, '/api/devices'),
    fetchApiData<Alert[]>(apiBaseUrl, '/api/alerts'),
    fetchApiData<Project[]>(apiBaseUrl, '/api/projects'),
    fetchMockUsers(),
  ])

  return {
    devices,
    alerts,
    projects,
    users,
  }
}

export async function saveProjectDraft(
  project: ProjectSaveInput,
  apiBaseUrl = getApiBaseUrl(),
): Promise<Project> {
  if (!apiBaseUrl) {
    return saveMockProjectDraft(project)
  }

  return fetchApiData<Project>(apiBaseUrl, '/api/projects', {
    body: JSON.stringify(project),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })
}

async function fetchApiData<T>(apiBaseUrl: string, path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, init)

  if (!response.ok) {
    throw new Error('API request failed.')
  }

  const body = (await response.json()) as ApiDataResponse<T>

  return body.data
}

function getApiBaseUrl(): string {
  return import.meta.env.VITE_API_BASE_URL?.trim() ?? ''
}
