import { Router } from 'express'
import { getAlerts, getRequestedMockUserId } from '../services/mockDashboardService'
import { sendData } from '../utils/apiResponse'

export const alertsRouter = Router()

alertsRouter.get('/alerts', (request, response) => {
  sendData(response, getAlerts(getRequestedMockUserId(request.header('x-mock-user-id') ?? request.query.userId)))
})
