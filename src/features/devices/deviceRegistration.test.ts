import { describe, expect, it } from 'vitest'
import { discoveredDevices } from '../../mocks/discoveredDevices'
import { projects } from '../../mocks/projects'
import { registerDiscoveredDevice } from './deviceRegistration'

describe('deviceRegistration', () => {
  it('uses the user-provided display name when registering a discovered device', () => {
    const result = registerDiscoveredDevice({
      discoveredDeviceId: 'discovered-camera-001',
      discoveredDevices,
      displayName: 'Giris Kamera',
      project: projects[0],
    })

    expect(result).toMatchObject({
      ok: true,
      device: {
        id: 'registered-discovered-camera-001',
        name: 'Giris Kamera',
        type: 'eo-ir',
        profile: 'thermal-camera',
        capabilities: ['snapshot', 'thermal-frame', 'motion-event', 'object-event'],
        ingestMode: 'snapshot',
        rawSource: 'network',
        customerId: 'customer-training',
        projectId: 'project-001',
      },
    })
  })

  it('rejects empty or unknown device registration input', () => {
    expect(
      registerDiscoveredDevice({
        discoveredDeviceId: 'discovered-camera-001',
        discoveredDevices,
        displayName: ' ',
        project: projects[0],
      }),
    ).toEqual({ ok: false, message: 'Cihaz adi en az 2 karakter olmalidir.' })

    expect(
      registerDiscoveredDevice({
        discoveredDeviceId: 'missing-device',
        discoveredDevices,
        displayName: 'Arka Bahce Kamera',
        project: projects[0],
      }),
    ).toEqual({ ok: false, message: 'Secilen cihaz bulunamadi.' })
  })
})
