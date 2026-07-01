import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { alerts } from '../../src/mocks/alerts'
import { devices } from '../../src/mocks/devices'
import { projects } from '../../src/mocks/projects'
import { createApp } from './app'

const app = createApp()

describe('RadarDesk API', () => {
  it('returns a health response', async () => {
    const response = await request(app).get('/health').expect(200)

    expect(response.body).toEqual({
      status: 'ok',
      service: 'radardesk-api',
    })
  })

  it('returns mock device, alert, and project lists', async () => {
    const [devicesResponse, alertsResponse, projectsResponse] = await Promise.all([
      request(app).get('/api/devices').expect(200),
      request(app).get('/api/alerts').expect(200),
      request(app).get('/api/projects').expect(200),
    ])

    expect(devicesResponse.body.data).toHaveLength(devices.length)
    expect(alertsResponse.body.data).toHaveLength(alerts.length)
    expect(projectsResponse.body.data).toHaveLength(projects.length)
  })

  it('creates a sanitized mock project draft', async () => {
    const response = await request(app)
      .post('/api/projects')
      .send({
        name: '  Field Survey  ',
        customer: '  Training Customer  ',
        site: '  Demo Site  ',
        status: 'draft',
        role: 'admin',
      })
      .expect(201)

    expect(response.body.data).toEqual({
      id: 'project-draft-local',
      name: 'Field Survey',
      customer: 'Training Customer',
      site: 'Demo Site',
      status: 'draft',
    })
  })

  it('rejects invalid project payloads', async () => {
    const response = await request(app)
      .post('/api/projects')
      .send({
        name: '',
        customer: 'Training Customer',
        site: 'Demo Site',
        status: 'draft',
      })
      .expect(400)

    expect(response.body).toEqual({
      error: {
        code: 'invalid_project',
        message: 'Project name is required.',
      },
    })
  })

  it.each([
    {
      name: 'missing payload',
      payload: undefined,
      message: 'Project payload is required.',
    },
    {
      name: 'missing customer',
      payload: {
        name: 'Field Survey',
        customer: '',
        site: 'Demo Site',
        status: 'draft',
      },
      message: 'Customer is required.',
    },
    {
      name: 'long site',
      payload: {
        name: 'Field Survey',
        customer: 'Training Customer',
        site: 'A'.repeat(81),
        status: 'draft',
      },
      message: 'Site must be 80 characters or fewer.',
    },
    {
      name: 'invalid status',
      payload: {
        name: 'Field Survey',
        customer: 'Training Customer',
        site: 'Demo Site',
        status: 'approved',
      },
      message: 'Project status is invalid.',
    },
  ])('rejects project payloads with $name', async ({ payload, message }) => {
    const requestBuilder = request(app).post('/api/projects')
    const response = await (payload === undefined ? requestBuilder : requestBuilder.send(payload)).expect(400)

    expect(response.body).toEqual({
      error: {
        code: 'invalid_project',
        message,
      },
    })
  })
})
