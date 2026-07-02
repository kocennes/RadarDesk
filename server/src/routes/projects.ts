import { Router } from 'express'
import { createProjectDraft, getProjects, getRequestedMockUserId } from '../services/mockDashboardService'
import { parseProjectSaveInput } from '../validation/projectValidation'
import { sendApiError, sendData } from '../utils/apiResponse'

export const projectsRouter = Router()

projectsRouter.get('/projects', (request, response) => {
  sendData(response, getProjects(getRequestedMockUserId(request.header('x-mock-user-id') ?? request.query.userId)))
})

projectsRouter.post('/projects', (request, response) => {
  const projectInput = parseProjectSaveInput(request.body)

  if (!projectInput.ok) {
    sendApiError(response, 400, 'invalid_project', projectInput.message)
    return
  }

  sendData(response, createProjectDraft(projectInput.value), 201)
})
