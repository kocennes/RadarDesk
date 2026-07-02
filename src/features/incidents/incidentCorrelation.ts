import type { AlertSeverity, Device, Incident, LocalEvidenceRef, SensorEvent } from '../../types/domain'

const correlationWindowMs = 10 * 60 * 1000

const severityRank: Record<AlertSeverity, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
}

export function buildIncidentsFromSensorEvents(events: SensorEvent[], devices: Device[]): Incident[] {
  const deviceById = new Map(devices.map((device) => [device.id, device]))
  const groups = new Map<string, SensorEvent[]>()

  for (const event of events) {
    const device = deviceById.get(event.deviceId)

    if (!device) {
      continue
    }

    const detectedAtMs = Date.parse(event.detectedAt)
    const timeBucket = Number.isNaN(detectedAtMs) ? 0 : Math.floor(detectedAtMs / correlationWindowMs)
    const groupKey = `${device.projectId}-${timeBucket}`
    const groupEvents = groups.get(groupKey) ?? []
    groupEvents.push(event)
    groups.set(groupKey, groupEvents)
  }

  return Array.from(groups.entries())
    .map(([groupKey, groupEvents]) => buildIncident(groupKey, groupEvents, deviceById))
    .sort((first, second) => Date.parse(second.updatedAt) - Date.parse(first.updatedAt))
}

function buildIncident(
  groupKey: string,
  events: SensorEvent[],
  deviceById: Map<string, Device>,
): Incident {
  const sortedEvents = [...events].sort((first, second) => Date.parse(first.detectedAt) - Date.parse(second.detectedAt))
  const firstEvent = sortedEvents[0]
  const lastEvent = sortedEvents[sortedEvents.length - 1]
  const projectId = deviceById.get(firstEvent.deviceId)?.projectId ?? 'project-unknown'
  const sourceDeviceIds = Array.from(new Set(sortedEvents.map((event) => event.deviceId)))
  const sourceDeviceTypes = new Set(
    sortedEvents
      .map((event) => deviceById.get(event.deviceId)?.type)
      .filter((deviceType): deviceType is Device['type'] => Boolean(deviceType)),
  )
  const severity = getHighestSeverity(sortedEvents)
  const confidence = getIncidentConfidence(sourceDeviceTypes.size, sortedEvents.length)
  const confirmationLevel = sourceDeviceTypes.size >= 2 ? 'multi-sensor' : 'single-sensor'
  const evidenceRefs = getEvidenceRefs(sortedEvents)

  return {
    id: `incident-${groupKey}`,
    confidence,
    confirmationLevel,
    createdAt: firstEvent.detectedAt,
    evidenceRefs,
    projectId,
    sensorEventIds: sortedEvents.map((event) => event.id),
    severity,
    sourceDeviceIds,
    status: confidence >= 0.75 ? 'reviewing' : 'open',
    title: getIncidentTitle(sourceDeviceTypes.size, sortedEvents.length),
    updatedAt: lastEvent.detectedAt,
  }
}

function getHighestSeverity(events: SensorEvent[]): AlertSeverity {
  return events.reduce<AlertSeverity>(
    (highestSeverity, event) =>
      severityRank[event.severity] > severityRank[highestSeverity] ? event.severity : highestSeverity,
    'low',
  )
}

function getIncidentConfidence(sourceTypeCount: number, eventCount: number): number {
  if (sourceTypeCount >= 3) {
    return 0.9
  }

  if (sourceTypeCount === 2) {
    return 0.75
  }

  return eventCount > 1 ? 0.55 : 0.35
}

function getEvidenceRefs(events: SensorEvent[]): LocalEvidenceRef[] {
  const seenEvidence = new Set<string>()
  const evidenceRefs: LocalEvidenceRef[] = []

  for (const event of events) {
    if (!event.evidence) {
      continue
    }

    const evidenceKey = [
      event.evidence.snapshotPath ?? '',
      event.evidence.clipPath ?? '',
      event.evidence.dataPath ?? '',
      event.evidence.hash ?? '',
    ].join('|')

    if (seenEvidence.has(evidenceKey)) {
      continue
    }

    evidenceRefs.push({ ...event.evidence })
    seenEvidence.add(evidenceKey)
  }

  return evidenceRefs
}

function getIncidentTitle(sourceTypeCount: number, eventCount: number): string {
  if (sourceTypeCount >= 2) {
    return `Coklu sensor olayi (${eventCount} kayit)`
  }

  return `Tek sensor olayi (${eventCount} kayit)`
}
