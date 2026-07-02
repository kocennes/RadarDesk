import type { Response } from 'express'

export function sendData<T>(response: Response, data: T, statusCode = 200) {
  response.status(statusCode).json({ data })
}

export function sendApiError(response: Response, statusCode: number, code: string, message: string) {
  response.status(statusCode).json({
    error: {
      code,
      message,
    },
  })
}
