import type { ErrorRequestHandler } from 'express'

export const errorHandler: ErrorRequestHandler = (_error, _request, response, _next) => {
  response.status(500).json({
    error: {
      code: 'internal_error',
      message: 'Unexpected server error.',
    },
  })
}
