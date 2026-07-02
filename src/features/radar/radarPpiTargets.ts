import type { SensorEvent } from '../../types/domain'

export type RadarPpiTarget = {
  id: string
  bearingDeg: number
  rangeM: number
  severity: SensorEvent['severity']
  speedMps?: number
  trackId: string
}

export function getRadarPpiTargets(events: SensorEvent[], maxRangeM = 1000): RadarPpiTarget[] {
  return events
    .filter((event) => event.kind === 'radar-track')
    .map((event) => toRadarPpiTarget(event, maxRangeM))
    .filter((target): target is RadarPpiTarget => target !== null)
}

function toRadarPpiTarget(event: SensorEvent, maxRangeM: number): RadarPpiTarget | null {
  const bearingDeg = getNumberMetadata(event, 'bearingDeg')
  const rangeM = getNumberMetadata(event, 'rangeM')

  if (bearingDeg === undefined || rangeM === undefined || rangeM < 0 || rangeM > maxRangeM) {
    return null
  }

  const speedMps = getNumberMetadata(event, 'speedMps')
  const trackId = event.metadata.trackId

  return {
    id: event.id,
    bearingDeg: normalizeBearing(bearingDeg),
    rangeM,
    severity: event.severity,
    speedMps,
    trackId: typeof trackId === 'string' ? trackId : event.id,
  }
}

function getNumberMetadata(event: SensorEvent, key: string): number | undefined {
  const value = event.metadata[key]

  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

function normalizeBearing(value: number): number {
  return ((value % 360) + 360) % 360
}
