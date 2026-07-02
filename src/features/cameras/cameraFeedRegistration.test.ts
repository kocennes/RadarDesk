import { describe, expect, it } from 'vitest'
import { devices } from '../../mocks/devices'
import { createCameraFeedForRegisteredDevice } from './cameraFeedRegistration'

describe('createCameraFeedForRegisteredDevice', () => {
  it('creates a safe local camera feed shell for EO/IR devices', () => {
    const cameraDevice = devices.find((device) => device.type === 'eo-ir')

    expect(cameraDevice).toBeDefined()
    expect(createCameraFeedForRegisteredDevice(cameraDevice!)).toMatchObject({
      deviceId: cameraDevice!.id,
      mode: 'thermal',
      source: 'mock',
      status: 'standby',
    })
  })

  it('does not create camera feeds for non-camera devices', () => {
    const radarDevice = devices.find((device) => device.type === 'radar')

    expect(radarDevice).toBeDefined()
    expect(createCameraFeedForRegisteredDevice(radarDevice!)).toBeNull()
  })
})
