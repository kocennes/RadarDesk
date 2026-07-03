import { Router } from 'express'
import { createCommandRequest, getCommandRequest, getRequestedMockUserId } from '../services/mockDashboardService'
import { sendApiError, sendData } from '../utils/apiResponse'
import { parseCommandRequestInput } from '../validation/commandValidation'

export const commandsRouter = Router()

commandsRouter.post('/commands/request', (request, response) => {
  const commandInput = parseCommandRequestInput(request.body)

  if (!commandInput.ok) {
    sendApiError(response, 400, 'invalid_command_request', commandInput.message)
    return
  }

  const commandResult = createCommandRequest(
    commandInput.value,
    getRequestedMockUserId(request.header('x-mock-user-id') ?? request.query.userId),
  )

  if (!commandResult) {
    sendApiError(response, 403, 'command_not_allowed', 'Command request is not allowed for this user or device.')
    return
  }

  sendData(response, commandResult, 201)
})

commandsRouter.get('/commands/:commandId', (request, response) => {
  const command = getCommandRequest(
    request.params.commandId,
    getRequestedMockUserId(request.header('x-mock-user-id') ?? request.query.userId),
  )

  if (!command) {
    sendApiError(response, 404, 'command_not_found', 'Command request could not be found.')
    return
  }

  sendData(response, command)
})
