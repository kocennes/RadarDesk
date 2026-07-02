import { Router } from 'express'
import { getDiscoveredDevices, getRequestedMockUserId } from '../services/mockDashboardService'
import { sendData } from '../utils/apiResponse'

export const deviceDiscoveryRouter = Router()

deviceDiscoveryRouter.get('/device-discovery', (request, response) => {
  sendData(
    response,
    getDiscoveredDevices(getRequestedMockUserId(request.header('x-mock-user-id') ?? request.query.userId)),
  )
})
