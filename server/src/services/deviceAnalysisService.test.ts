import { describe, expect, it } from 'vitest'
import { getAnalysisPipelineForProfile } from './deviceAnalysisService'

describe('deviceAnalysisService', () => {
  it('selects camera, radar, and RF analysis pipelines by backend-controlled profile', () => {
    expect(getAnalysisPipelineForProfile('thermal-camera')).toMatchObject({
      id: 'thermal-frame-pipeline',
      eventKinds: ['thermal-motion', 'camera-object'],
      localEvidence: 'snapshot',
    })

    expect(getAnalysisPipelineForProfile('radar')).toMatchObject({
      id: 'radar-track-pipeline',
      eventKinds: ['radar-track', 'radar-zone'],
      localEvidence: 'metadata-only',
    })

    expect(getAnalysisPipelineForProfile('rf-receiver')).toMatchObject({
      id: 'rf-signal-pipeline',
      eventKinds: ['rf-signal', 'rf-frequency'],
      localEvidence: 'metadata-only',
    })
  })
})
