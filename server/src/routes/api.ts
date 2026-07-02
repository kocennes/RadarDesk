import { Router } from 'express'
import { accessRouter } from './access'
import { alertsRouter } from './alerts'
import { cameraFeedsRouter } from './cameraFeeds'
import { deviceDiscoveryRouter } from './deviceDiscovery'
import { devicesRouter } from './devices'
import { incidentsRouter } from './incidents'
import { projectsRouter } from './projects'
import { sensorEventsRouter } from './sensorEvents'

export const apiRouter = Router()

apiRouter.use('/api', accessRouter)
apiRouter.use('/api', deviceDiscoveryRouter)
apiRouter.use('/api', devicesRouter)
apiRouter.use('/api', alertsRouter)
apiRouter.use('/api', sensorEventsRouter)
apiRouter.use('/api', incidentsRouter)
apiRouter.use('/api', projectsRouter)
apiRouter.use('/api', cameraFeedsRouter)
