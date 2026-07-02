import { Router } from 'express'
import { getCameraFeeds, getRequestedMockUserId } from '../services/mockDashboardService'
import { captureCameraSnapshot } from '../services/cameraSnapshotService'
import { sendApiError, sendData } from '../utils/apiResponse'

export const cameraFeedsRouter = Router()

cameraFeedsRouter.get('/camera-feeds', (request, response) => {
  sendData(response, getCameraFeeds(getRequestedMockUserId(request.header('x-mock-user-id') ?? request.query.userId)))
})

cameraFeedsRouter.post('/camera-feeds/:cameraFeedId/snapshot', async (request, response, next) => {
  try {
    const evidence = await captureCameraSnapshot(request.params.cameraFeedId)

    if (!evidence) {
      sendApiError(response, 404, 'camera_feed_not_found', 'Camera feed could not be found.')
      return
    }

    sendData(response, evidence, 201)
  } catch (error) {
    next(error)
  }
})
