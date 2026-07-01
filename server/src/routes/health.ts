import { Router } from 'express'
import type { HealthResponse } from '../types/api'

export const healthRouter = Router()

healthRouter.get('/health', (_request, response) => {
  const body: HealthResponse = {
    status: 'ok',
    service: 'radardesk-api',
  }

  response.json(body)
})
