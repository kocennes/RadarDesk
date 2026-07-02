type AlertSeverity = 'critical' | 'high' | 'low' | 'medium'

type SensorEventKind =
  | 'camera-motion'
  | 'camera-object'
  | 'device-state'
  | 'radar-track'
  | 'radar-zone'
  | 'rf-frequency'
  | 'rf-signal'
  | 'thermal-motion'

type SensorEventIngestPayload = {
  cameraFeedId?: string
  deviceId: string
  kind: SensorEventKind
  metadata: Record<string, string | number | boolean>
  severity: AlertSeverity
}

type ScenarioName = 'all' | 'approaching' | 'multi-sensor' | 'receding' | 'rf-radar' | 'zone'

type StreamOptions = {
  baseUrl: string
  dryRun: boolean
  intervalMs: number
  repeat: number
  scenario: ScenarioName
  userId: string
}

type ScenarioStep = {
  label: string
  payload: SensorEventIngestPayload
}

const scenarioNames: ScenarioName[] = ['all', 'approaching', 'receding', 'zone', 'rf-radar', 'multi-sensor']

const defaultOptions: StreamOptions = {
  baseUrl: 'http://localhost:4000',
  dryRun: false,
  intervalMs: 1200,
  repeat: 1,
  scenario: 'all',
  userId: 'user-admin-001',
}

async function main() {
  const options = parseOptions(process.argv.slice(2))
  const steps = buildScenarioSteps(options.scenario)
  let cycle = 0

  console.log(
    [
      `RadarDesk mock sensor streamer`,
      `scenario=${options.scenario}`,
      `steps=${steps.length}`,
      `intervalMs=${options.intervalMs}`,
      `repeat=${options.repeat === 0 ? 'infinite' : options.repeat}`,
      `baseUrl=${options.baseUrl}`,
      options.dryRun ? 'dryRun=true' : '',
    ]
      .filter(Boolean)
      .join(' | '),
  )

  while (options.repeat === 0 || cycle < options.repeat) {
    cycle += 1

    for (const [index, step] of steps.entries()) {
      await postStep(step, options, cycle, index + 1)
      await delay(options.intervalMs)
    }
  }
}

function parseOptions(args: string[]): StreamOptions {
  const options = { ...defaultOptions }

  for (const arg of args) {
    if (arg === '--dry-run') {
      options.dryRun = true
      continue
    }

    const [key, value] = arg.split('=')

    if (!value) {
      continue
    }

    if (key === '--base-url') {
      options.baseUrl = value.replace(/\/$/, '')
    }

    if (key === '--interval-ms') {
      options.intervalMs = parsePositiveInteger(value, options.intervalMs)
    }

    if (key === '--repeat') {
      options.repeat = parseNonNegativeInteger(value, options.repeat)
    }

    if (key === '--scenario') {
      options.scenario = parseScenarioName(value)
    }

    if (key === '--user-id') {
      options.userId = value.trim() || options.userId
    }
  }

  return options
}

function parseScenarioName(value: string): ScenarioName {
  if (scenarioNames.includes(value as ScenarioName)) {
    return value as ScenarioName
  }

  throw new Error(`Unknown scenario "${value}". Use one of: ${scenarioNames.join(', ')}`)
}

function buildScenarioSteps(scenario: ScenarioName): ScenarioStep[] {
  const scenarioMap: Record<Exclude<ScenarioName, 'all'>, ScenarioStep[]> = {
    approaching: buildApproachingTargetScenario(),
    receding: buildRecedingTargetScenario(),
    zone: buildZoneEntryScenario(),
    'rf-radar': buildRfRadarMatchScenario(),
    'multi-sensor': buildMultiSensorIncidentScenario(),
  }

  if (scenario === 'all') {
    return [
      ...scenarioMap.approaching,
      ...scenarioMap.receding,
      ...scenarioMap.zone,
      ...scenarioMap['rf-radar'],
      ...scenarioMap['multi-sensor'],
    ]
  }

  return scenarioMap[scenario]
}

function buildApproachingTargetScenario(): ScenarioStep[] {
  return [720, 560, 410, 260].map((rangeM, index) => ({
    label: `approaching-target-${index + 1}`,
    payload: {
      deviceId: 'radar-001',
      kind: 'radar-track',
      metadata: {
        bearingDeg: 24,
        scenario: 'approaching-target',
        speedMps: 8 + index,
        trackId: 'T-APPROACH-01',
        rangeM,
      },
      severity: rangeM <= 300 ? 'high' : 'medium',
    },
  }))
}

function buildRecedingTargetScenario(): ScenarioStep[] {
  return [220, 380, 620, 840].map((rangeM, index) => ({
    label: `receding-target-${index + 1}`,
    payload: {
      deviceId: 'radar-001',
      kind: 'radar-track',
      metadata: {
        bearingDeg: 212,
        scenario: 'receding-target',
        speedMps: 6,
        trackId: 'T-RECEDING-01',
        rangeM,
      },
      severity: index === 0 ? 'medium' : 'low',
    },
  }))
}

function buildZoneEntryScenario(): ScenarioStep[] {
  return [
    {
      label: 'zone-entry-track',
      payload: {
        deviceId: 'radar-001',
        kind: 'radar-track',
        metadata: {
          bearingDeg: 18,
          scenario: 'restricted-zone-entry',
          speedMps: 7,
          trackId: 'T-ZONE-01',
          rangeM: 340,
        },
        severity: 'high',
      },
    },
    {
      label: 'zone-entry-alert',
      payload: {
        deviceId: 'radar-001',
        kind: 'radar-zone',
        metadata: {
          scenario: 'restricted-zone-entry',
          trackId: 'T-ZONE-01',
          zoneId: 'north-restricted-demo',
          zoneRule: 'entry',
        },
        severity: 'critical',
      },
    },
  ]
}

function buildRfRadarMatchScenario(): ScenarioStep[] {
  return [
    {
      label: 'rf-burst-match',
      payload: {
        deviceId: 'rf-002',
        kind: 'rf-signal',
        metadata: {
          durationSec: 4,
          frequencyMhz: 2450,
          scenario: 'rf-radar-match',
          signalDbm: -51,
        },
        severity: 'high',
      },
    },
    {
      label: 'radar-track-match',
      payload: {
        deviceId: 'radar-001',
        kind: 'radar-track',
        metadata: {
          bearingDeg: 31,
          matchedRfFrequencyMhz: 2450,
          scenario: 'rf-radar-match',
          speedMps: 9,
          trackId: 'T-RF-MATCH-01',
          rangeM: 390,
        },
        severity: 'high',
      },
    },
  ]
}

function buildMultiSensorIncidentScenario(): ScenarioStep[] {
  return [
    {
      label: 'multi-radar-track',
      payload: {
        deviceId: 'radar-001',
        kind: 'radar-track',
        metadata: {
          bearingDeg: 42,
          scenario: 'multi-sensor-incident',
          speedMps: 8,
          trackId: 'T-MULTI-01',
          rangeM: 360,
        },
        severity: 'high',
      },
    },
    {
      label: 'multi-rf-signal',
      payload: {
        deviceId: 'rf-002',
        kind: 'rf-signal',
        metadata: {
          durationSec: 5,
          frequencyMhz: 2462,
          scenario: 'multi-sensor-incident',
          signalDbm: -48,
        },
        severity: 'high',
      },
    },
    {
      label: 'multi-camera-confirmation',
      payload: {
        cameraFeedId: 'camera-feed-001',
        deviceId: 'eo-003',
        kind: 'thermal-motion',
        metadata: {
          area: 'Kuzey cevre',
          confidence: 0.86,
          scenario: 'multi-sensor-incident',
        },
        severity: 'high',
      },
    },
  ]
}

async function postStep(step: ScenarioStep, options: StreamOptions, cycle: number, stepNumber: number) {
  const payload = {
    ...step.payload,
    metadata: {
      ...step.payload.metadata,
      cycle,
      streamer: 'mock-sensor-streamer',
    },
  }

  if (options.dryRun) {
    console.log(`[dry-run] cycle=${cycle} step=${stepNumber} ${step.label}`, JSON.stringify(payload))
    return
  }

  const response = await fetch(`${options.baseUrl}/api/sensor-events/ingest`, {
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
      'x-mock-user-id': options.userId,
    },
    method: 'POST',
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Ingest failed for ${step.label}: HTTP ${response.status} ${body}`)
  }

  console.log(`[sent] cycle=${cycle} step=${stepNumber} ${step.label}`)
}

function parsePositiveInteger(value: string, fallback: number): number {
  const parsed = Number.parseInt(value, 10)

  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

function parseNonNegativeInteger(value: string, fallback: number): number {
  const parsed = Number.parseInt(value, 10)

  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
