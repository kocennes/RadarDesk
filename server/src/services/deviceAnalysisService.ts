import type { Device, DeviceProfile, SensorEventKind } from '../../../src/types/domain'

export type AnalysisPipeline = {
  id: string
  profile: DeviceProfile
  eventKinds: SensorEventKind[]
  localEvidence: 'snapshot' | 'clip' | 'metadata-only'
}

const analysisPipelines: Record<DeviceProfile, AnalysisPipeline> = {
  c2: {
    id: 'c2-state-pipeline',
    profile: 'c2',
    eventKinds: ['device-state'],
    localEvidence: 'metadata-only',
  },
  radar: {
    id: 'radar-track-pipeline',
    profile: 'radar',
    eventKinds: ['radar-track', 'radar-zone'],
    localEvidence: 'metadata-only',
  },
  'rf-receiver': {
    id: 'rf-signal-pipeline',
    profile: 'rf-receiver',
    eventKinds: ['rf-signal', 'rf-frequency'],
    localEvidence: 'metadata-only',
  },
  'thermal-camera': {
    id: 'thermal-frame-pipeline',
    profile: 'thermal-camera',
    eventKinds: ['thermal-motion', 'camera-object'],
    localEvidence: 'snapshot',
  },
  'visible-camera': {
    id: 'visible-frame-pipeline',
    profile: 'visible-camera',
    eventKinds: ['camera-motion', 'camera-object'],
    localEvidence: 'snapshot',
  },
}

export function getAnalysisPipelineForProfile(profile: DeviceProfile): AnalysisPipeline {
  return analysisPipelines[profile]
}

export function getAnalysisPipelineForDevice(device: Pick<Device, 'profile'>): AnalysisPipeline {
  return getAnalysisPipelineForProfile(device.profile)
}
