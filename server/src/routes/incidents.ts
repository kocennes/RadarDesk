import { Router } from 'express'
import { getIncidents, getRequestedMockUserId, updateIncidentReview } from '../services/mockDashboardService'
import { sendApiError, sendData } from '../utils/apiResponse'
import { parseIncidentReviewInput } from '../validation/incidentReviewValidation'

export const incidentsRouter = Router()

incidentsRouter.get('/incidents', (request, response) => {
  sendData(response, getIncidents(getRequestedMockUserId(request.header('x-mock-user-id') ?? request.query.userId)))
})

incidentsRouter.patch('/incidents/:incidentId/review', (request, response) => {
  const reviewInput = parseIncidentReviewInput(request.body)

  if (!reviewInput.ok) {
    sendApiError(response, 400, 'invalid_incident_review', reviewInput.message)
    return
  }

  const incident = updateIncidentReview(
    request.params.incidentId,
    reviewInput.value,
    getRequestedMockUserId(request.header('x-mock-user-id') ?? request.query.userId),
  )

  if (!incident) {
    sendApiError(response, 404, 'incident_not_found', 'Incident could not be found.')
    return
  }

  sendData(response, incident)
})
