import type { Alert, AlertSeverity, Device, Incident } from '../../types/domain'

export type LatLngTuple = [number, number]

export type AlertOverlay = {
  alert: Alert
  position: LatLngTuple
  sourceDevice: Device
}

export type IncidentOverlay = {
  incident: Incident
  position: LatLngTuple
}

const severityRank: Record<AlertSeverity, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
}

export function getMapCenter(devices: Device[]): LatLngTuple {
  if (devices.length === 0) {
    return [41.0082, 28.9784]
  }

  const total = devices.reduce(
    (position, device) => ({
      latitude: position.latitude + device.latitude,
      longitude: position.longitude + device.longitude,
    }),
    { latitude: 0, longitude: 0 },
  )

  return [total.latitude / devices.length, total.longitude / devices.length]
}

export function getRangeMeters(device: Device): number {
  return device.rangeKm * 1000
}

export function getCameraSectorPoints(
  device: Device,
  bearingDeg = 35,
  fieldOfViewDeg = 72,
  steps = 8,
): LatLngTuple[] {
  const center: LatLngTuple = [device.latitude, device.longitude]
  const startBearing = bearingDeg - fieldOfViewDeg / 2
  const stepSize = fieldOfViewDeg / steps
  const arcPoints = Array.from({ length: steps + 1 }, (_, index) =>
    getDestinationPoint(center, getRangeMeters(device), startBearing + stepSize * index),
  )

  return [center, ...arcPoints]
}

export function getDeviceBearingLine(device: Device, bearingDeg = 35): LatLngTuple[] {
  const center: LatLngTuple = [device.latitude, device.longitude]

  return [center, getDestinationPoint(center, getRangeMeters(device), bearingDeg)]
}

export function getAlertOverlays(alerts: Alert[], devices: Device[]): AlertOverlay[] {
  return alerts.flatMap((alert) => {
    const sourceDevice = devices.find((device) => device.id === alert.sourceDeviceId)

    if (!sourceDevice) {
      return []
    }

    return [
      {
        alert,
        position: [sourceDevice.latitude, sourceDevice.longitude],
        sourceDevice,
      },
    ]
  })
}

export function getFeaturedIncidentOverlay(incidents: Incident[], devices: Device[]): IncidentOverlay | undefined {
  const deviceById = new Map(devices.map((device) => [device.id, device]))

  return incidents
    .filter((incident) => incident.severity === 'high' || incident.severity === 'critical')
    .map((incident) => {
      const sourceDevices = incident.sourceDeviceIds
        .map((deviceId) => deviceById.get(deviceId))
        .filter((device): device is Device => Boolean(device))

      if (sourceDevices.length === 0) {
        return undefined
      }

      return {
        incident,
        position: getAveragePosition(sourceDevices),
        score: severityRank[incident.severity] * 100 + Math.round(incident.confidence * 100),
      }
    })
    .filter((overlay): overlay is IncidentOverlay & { score: number } => Boolean(overlay))
    .sort((first, second) => second.score - first.score)[0]
}

function getAveragePosition(devices: Device[]): LatLngTuple {
  const total = devices.reduce(
    (position, device) => ({
      latitude: position.latitude + device.latitude,
      longitude: position.longitude + device.longitude,
    }),
    { latitude: 0, longitude: 0 },
  )

  return [total.latitude / devices.length, total.longitude / devices.length]
}

function getDestinationPoint(center: LatLngTuple, distanceMeters: number, bearingDeg: number): LatLngTuple {
  const earthRadiusMeters = 6_371_000
  const angularDistance = distanceMeters / earthRadiusMeters
  const bearingRad = toRadians(bearingDeg)
  const latitudeRad = toRadians(center[0])
  const longitudeRad = toRadians(center[1])

  const destinationLatitude = Math.asin(
    Math.sin(latitudeRad) * Math.cos(angularDistance) +
      Math.cos(latitudeRad) * Math.sin(angularDistance) * Math.cos(bearingRad),
  )
  const destinationLongitude =
    longitudeRad +
    Math.atan2(
      Math.sin(bearingRad) * Math.sin(angularDistance) * Math.cos(latitudeRad),
      Math.cos(angularDistance) - Math.sin(latitudeRad) * Math.sin(destinationLatitude),
    )

  return [toDegrees(destinationLatitude), toDegrees(destinationLongitude)]
}

function toRadians(value: number): number {
  return (value * Math.PI) / 180
}

function toDegrees(value: number): number {
  return (value * 180) / Math.PI
}
