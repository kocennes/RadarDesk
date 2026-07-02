import { Router } from 'express'
import {
  createRegisteredDevice,
  deleteRegisteredDevice,
  disconnectRegisteredDevice,
  getDevices,
  getRequestedMockUserId,
} from '../services/mockDashboardService'
import { sendApiError, sendData } from '../utils/apiResponse'
import { parseRegisterDeviceInput } from '../validation/deviceRegistrationValidation'

export const devicesRouter = Router()

devicesRouter.get('/devices', (request, response) => {
  sendData(response, getDevices(getRequestedMockUserId(request.header('x-mock-user-id') ?? request.query.userId)))
})

devicesRouter.post('/devices/register', (request, response) => {
  const deviceInput = parseRegisterDeviceInput(request.body)

  if (!deviceInput.ok) {
    sendApiError(response, 400, 'invalid_device_registration', deviceInput.message)
    return
  }

  const registeredDevice = createRegisteredDevice(
    deviceInput.value,
    getRequestedMockUserId(request.header('x-mock-user-id') ?? request.query.userId),
  )

  if (!registeredDevice) {
    sendApiError(response, 404, 'device_not_found', 'Selected device could not be registered.')
    return
  }

  sendData(response, registeredDevice, 201)
})

devicesRouter.patch('/devices/:deviceId/disconnect', (request, response) => {
  const disconnectedDevice = disconnectRegisteredDevice(
    request.params.deviceId,
    getRequestedMockUserId(request.header('x-mock-user-id') ?? request.query.userId),
  )

  if (!disconnectedDevice) {
    sendApiError(response, 404, 'device_not_found', 'Selected device could not be disconnected.')
    return
  }

  sendData(response, disconnectedDevice)
})

devicesRouter.delete('/devices/:deviceId', (request, response) => {
  const deleted = deleteRegisteredDevice(
    request.params.deviceId,
    getRequestedMockUserId(request.header('x-mock-user-id') ?? request.query.userId),
  )

  if (!deleted) {
    sendApiError(response, 404, 'device_not_found', 'Selected device could not be deleted.')
    return
  }

  response.status(204).send()
})
