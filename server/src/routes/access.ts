import { Router } from 'express'
import { getAccess, getRequestedMockUserId } from '../services/mockDashboardService'
import { sendData } from '../utils/apiResponse'

export const accessRouter = Router()

accessRouter.get('/access', (request, response) => {
  sendData(response, getAccess(getRequestedMockUserId(request.header('x-mock-user-id') ?? request.query.userId)))
})
