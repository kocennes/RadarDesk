export type ApiErrorResponse = {
  error: {
    code: string
    message: string
  }
}

export type HealthResponse = {
  status: 'ok'
  service: 'radardesk-api'
}
