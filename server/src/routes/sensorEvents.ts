import { Router } from 'express'
import { createSensorEvent, getRequestedMockUserId, getSensorEvents } from '../services/mockDashboardService'
import { sendApiError, sendData } from '../utils/apiResponse'
import { parseSensorEventInput } from '../validation/sensorEventValidation'

export const sensorEventsRouter = Router()

sensorEventsRouter.get('/sensor-events', (request, response) => {
  sendData(response, getSensorEvents(getRequestedMockUserId(request.header('x-mock-user-id') ?? request.query.userId)))
})

sensorEventsRouter.post('/sensor-events/ingest', async (request, response, next) => {
  try {
    const sensorEventInput = parseSensorEventInput(request.body)

    if (!sensorEventInput.ok) {
      sendApiError(response, 400, 'invalid_sensor_event', sensorEventInput.message)
      return
    }

    const sensorEvent = await createSensorEvent(
      sensorEventInput.value,
      getRequestedMockUserId(request.header('x-mock-user-id') ?? request.query.userId),
    )

    if (!sensorEvent) {
      sendApiError(response, 404, 'sensor_event_device_not_found', 'Sensor event device could not be used.')
      return
    }

    sendData(response, sensorEvent, 201)
  } catch (error) {
    next(error)
  }
})
