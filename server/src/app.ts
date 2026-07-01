import cors from 'cors'
import express from 'express'
import { apiRouter } from './routes/api'
import { healthRouter } from './routes/health'
import { errorHandler } from './middleware/errorHandler'

export function createApp() {
  const app = express()
  const corsOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:5173'

  app.use(cors({ origin: corsOrigin }))
  app.use(express.json({ limit: '100kb' }))
  app.use(healthRouter)
  app.use(apiRouter)
  app.use(errorHandler)

  return app
}
