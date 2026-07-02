import { getCameraFeedConfigById } from './cameraFeedProvider'
import { storeLocalEvidence, type StoredEvidence } from './localEvidenceService'

const mockSnapshotContentType = 'text/plain'

export async function captureCameraSnapshot(cameraFeedId: string): Promise<StoredEvidence | null> {
  const cameraFeed = getCameraFeedConfigById(cameraFeedId)

  if (!cameraFeed) {
    return null
  }

  if (cameraFeed.source === 'real' && cameraFeed.snapshotUrl) {
    const response = await fetch(cameraFeed.snapshotUrl)

    if (!response.ok) {
      throw new Error('Camera snapshot request failed.')
    }

    const contentType = response.headers.get('content-type') ?? 'application/octet-stream'
    const content = Buffer.from(await response.arrayBuffer())

    return storeLocalEvidence({
      content,
      contentType,
      extension: getExtensionForContentType(contentType),
      feedId: cameraFeed.id,
    })
  }

  return storeLocalEvidence({
    content: Buffer.from(`mock snapshot for ${cameraFeed.id}\n`, 'utf8'),
    contentType: mockSnapshotContentType,
    extension: 'txt',
    feedId: cameraFeed.id,
  })
}

function getExtensionForContentType(contentType: string): string {
  if (contentType.includes('png')) {
    return 'png'
  }

  if (contentType.includes('jpeg') || contentType.includes('jpg')) {
    return 'jpg'
  }

  return 'bin'
}
