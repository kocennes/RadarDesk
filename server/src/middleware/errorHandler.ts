import type { ErrorRequestHandler } from 'express'
import { sendApiError } from '../utils/apiResponse'

export const errorHandler: ErrorRequestHandler = (_error, _request, response, _next) => {
  sendApiError(response, 500, 'internal_error', 'Unexpected server error.')
}
