import { useState } from 'react'
import { Circle, CircleMarker, LayerGroup, LayersControl, MapContainer, Polygon, Polyline, Popup, TileLayer, Tooltip } from 'react-leaflet'
import type { Alert, AlertSeverity, Device, Incident } from '../../types/domain'
import {
  getAlertOverlays,
  getCameraSectorPoints,
  getDeviceBearingLine,
  getFeaturedIncidentOverlay,
  getMapCenter,
  getRangeMeters,
  type AlertOverlay,
  type IncidentOverlay,
} from './mapUtils'
import 'leaflet/dist/leaflet.css'

type OperationsMapProps = {
  alerts: Alert[]
  devices: Device[]
  incidents: Incident[]
}

const maxAnimatedAlertOverlays = 3

const deviceColors: Record<Device['type'], string> = {
  radar: '#c50f1f',
  rf: '#f59e0b',
  'eo-ir': '#2563eb',
  c2: '#107c10',
}

const alertColors: Record<AlertSeverity, string> = {
  low: '#2563eb',
  medium: '#f59e0b',
  high: '#c50f1f',
  critical: '#7f1d1d',
}

const deviceStatusLabel: Record<Device['status'], string> = {
  alarm: 'Alarm',
  offline: 'Offline',
  online: 'Online',
  warning: 'Uyari',
}

const alertSeverityLabel: Record<AlertSeverity, string> = {
  low: 'Dusuk',
  medium: 'Orta',
  high: 'Yuksek',
  critical: 'Kritik',
}

const deviceTypeLabel: Record<Device['type'], string> = {
  c2: 'C2',
  'eo-ir': 'EO/IR',
  radar: 'RADAR',
  rf: 'RF',
}

export function OperationsMap({ alerts, devices, incidents }: OperationsMapProps) {
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>(devices[0]?.id ?? '')
  const center = getMapCenter(devices)
  const alertOverlays = getAlertOverlays(alerts, devices)
  const animatedAlertOverlays = getAnimatedAlertOverlays(alertOverlays)
  const featuredIncidentOverlay = getFeaturedIncidentOverlay(incidents, devices)

  return (
    <MapContainer
      center={center}
      className="leaflet-map"
      scrollWheelZoom={false}
      zoom={13}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <LayersControl position="topright">
        <LayersControl.Overlay checked name="Cihaz markerlari">
          <LayerGroup>
            {devices.map((device) =>
              renderDeviceMarker(device, selectedDeviceId === device.id, () => setSelectedDeviceId(device.id)),
            )}
          </LayerGroup>
        </LayersControl.Overlay>
        <LayersControl.Overlay checked name="Sensor kapsama">
          <LayerGroup>
            {devices.map((device) => renderCoverageLayer(device, selectedDeviceId === device.id))}
          </LayerGroup>
        </LayersControl.Overlay>
        <LayersControl.Overlay checked name="Alarm katmanlari">
          <LayerGroup>
            {alertOverlays.map((overlay) => renderAlertOverlay(overlay))}
            {animatedAlertOverlays.map((overlay) => renderAlertSonar(overlay))}
            {featuredIncidentOverlay ? renderFeaturedIncidentSonar(featuredIncidentOverlay) : null}
          </LayerGroup>
        </LayersControl.Overlay>
      </LayersControl>
    </MapContainer>
  )
}

function getAnimatedAlertOverlays(alertOverlays: AlertOverlay[]): AlertOverlay[] {
  return alertOverlays
    .filter((overlay) => overlay.alert.severity === 'high' || overlay.alert.severity === 'critical')
    .sort((first, second) => getAlertPriority(second.alert.severity) - getAlertPriority(first.alert.severity))
    .slice(0, maxAnimatedAlertOverlays)
}

function renderDeviceMarker(device: Device, isSelected: boolean, onSelectDevice: () => void) {
  const position: [number, number] = [device.latitude, device.longitude]
  const color = deviceColors[device.type]

  return (
    <CircleMarker
      center={position}
      color="#ffffff"
      fillColor={color}
      fillOpacity={device.status === 'offline' ? 0.42 : 1}
      eventHandlers={{ click: onSelectDevice }}
      key={device.id}
      radius={isSelected ? 12 : 9}
      weight={isSelected ? 4 : 2}
    >
      <Popup>
        <div className="hud-popup">
          <strong>{device.name}</strong>
          <div className="hud-mini-grid">
            <HudMetric label="TYPE" value={deviceTypeLabel[device.type]} />
            <HudMetric label="RNG" value={`${getRangeMeters(device)}m`} />
            <HudMetric label="STATUS" value={deviceStatusLabel[device.status].toUpperCase()} />
          </div>
        </div>
      </Popup>
      <Tooltip className="map-hover-tooltip" direction="top" opacity={1}>
        <QuickInfoCard
          title={device.name}
          items={[
            ['STATUS', deviceStatusLabel[device.status].toUpperCase()],
            ['SEV', getDeviceSeverityLabel(device)],
            ['LAST', device.lastSeen],
            ['RNG', `${getRangeMeters(device)}m`],
            ['LOC', device.location],
          ]}
        />
      </Tooltip>
    </CircleMarker>
  )
}

function renderCoverageLayer(device: Device, isSelected: boolean) {
  if (device.type === 'eo-ir') {
    return renderCameraCoverage(device, isSelected)
  }

  return renderRangeCoverage(device, isSelected)
}

function renderRangeCoverage(device: Device, isSelected: boolean) {
  const position: [number, number] = [device.latitude, device.longitude]
  const color = deviceColors[device.type]
  const isOffline = device.status === 'offline'
  const isRf = device.type === 'rf'
  const isRadar = device.type === 'radar'

  return (
    <Circle
      center={position}
      className={`coverage-layer coverage-${device.type} ${isSelected ? 'coverage-selected' : ''} ${
        isOffline ? 'coverage-offline' : ''
      }`}
      color={color}
      fillColor={color}
      fillOpacity={isOffline ? 0.025 : isSelected ? 0.18 : isRadar ? 0.12 : 0.07}
      key={`${device.id}-range`}
      radius={getRangeMeters(device)}
      dashArray={isRf ? '10 8' : undefined}
      opacity={isOffline ? 0.22 : isSelected ? 0.98 : 0.68}
      weight={isSelected ? 4 : isRadar ? 3 : 2}
    >
      <Popup>
        <div className="hud-popup">
          <strong>{device.name}</strong>
          <div className="hud-mini-grid">
            <HudMetric label="RNG" value={`${device.rangeKm}km`} />
            <HudMetric label="LAYER" value="COVERAGE" />
          </div>
        </div>
      </Popup>
      <Tooltip className="map-hover-tooltip" direction="top" opacity={1}>
        <QuickInfoCard
          title={device.name}
          items={[
            ['STATUS', deviceStatusLabel[device.status].toUpperCase()],
            ['SEV', getDeviceSeverityLabel(device)],
            ['RNG', `${device.rangeKm}km`],
            ['LOC', device.location],
          ]}
        />
      </Tooltip>
    </Circle>
  )
}

function renderCameraCoverage(device: Device, isSelected: boolean) {
  const color = deviceColors[device.type]
  const isOffline = device.status === 'offline'

  return (
    <LayerGroup key={`${device.id}-camera-coverage`}>
      <Polygon
        className={`coverage-layer coverage-camera ${isSelected ? 'coverage-selected' : ''} ${
          isOffline ? 'coverage-offline' : ''
        }`}
        color={color}
        fillColor={color}
        fillOpacity={isOffline ? 0.03 : isSelected ? 0.22 : 0.12}
        opacity={isOffline ? 0.22 : isSelected ? 0.98 : 0.7}
        positions={getCameraSectorPoints(device)}
        weight={isSelected ? 4 : 2}
      >
        <Popup>
          <div className="hud-popup">
            <strong>{device.name}</strong>
            <div className="hud-mini-grid">
              <HudMetric label="FOV" value="72 DEG" />
              <HudMetric label="RNG" value={`${device.rangeKm}km`} />
            </div>
          </div>
        </Popup>
        <Tooltip className="map-hover-tooltip" direction="top" opacity={1}>
          <QuickInfoCard
            title={device.name}
            items={[
              ['STATUS', deviceStatusLabel[device.status].toUpperCase()],
              ['FOV', '72 DEG'],
              ['RNG', `${device.rangeKm}km`],
              ['LOC', device.location],
            ]}
          />
        </Tooltip>
      </Polygon>
      <Polyline
        className={`coverage-bearing ${isSelected ? 'coverage-selected' : ''} ${
          isOffline ? 'coverage-offline' : ''
        }`}
        color={color}
        opacity={isOffline ? 0.24 : isSelected ? 1 : 0.78}
        positions={getDeviceBearingLine(device)}
        weight={isSelected ? 4 : 2}
      />
    </LayerGroup>
  )
}

function renderAlertOverlay({ alert, position, sourceDevice }: AlertOverlay) {
  const color = alertColors[alert.severity]

  return (
    <CircleMarker
      center={position}
      color={color}
      fillColor={color}
      fillOpacity={0.24}
      key={`${alert.id}-overlay`}
      radius={18}
      weight={3}
    >
      <Popup>
        <div className="hud-popup">
          <strong>{alert.title}</strong>
          <div className="hud-mini-grid">
            <HudMetric label="LVL" value={alertSeverityLabel[alert.severity].toUpperCase()} />
            <HudMetric label="AREA" value={alert.area} />
          </div>
        </div>
      </Popup>
      <Tooltip className="map-hover-tooltip" direction="top" opacity={1}>
        <QuickInfoCard
          title={sourceDevice.name}
          items={[
            ['SEV', alertSeverityLabel[alert.severity].toUpperCase()],
            ['STATUS', deviceStatusLabel[sourceDevice.status].toUpperCase()],
            ['LAST', alert.timestamp],
            ['LOC', alert.area],
          ]}
        />
      </Tooltip>
    </CircleMarker>
  )
}

function HudMetric({ label, value }: { label: string; value: string }) {
  return (
    <span className="hud-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </span>
  )
}

function renderAlertSonar({ alert, position }: AlertOverlay) {
  const color = alertColors[alert.severity]

  return (
    <CircleMarker
      center={position}
      className={`sonar-ring sonar-${alert.severity}`}
      color={color}
      fillColor={color}
      fillOpacity={0.08}
      interactive={false}
      key={`${alert.id}-sonar`}
      radius={30}
      weight={2}
    />
  )
}

function renderFeaturedIncidentSonar({ incident, position }: IncidentOverlay) {
  const color = alertColors[incident.severity]

  return (
    <CircleMarker
      center={position}
      className={`sonar-ring sonar-incident sonar-${incident.severity}`}
      color={color}
      fillColor={color}
      fillOpacity={0.1}
      key={`${incident.id}-featured-sonar`}
      radius={42}
      weight={3}
    >
      <Popup>
        <div className="hud-popup">
          <strong>{incident.title}</strong>
          <div className="hud-mini-grid">
            <HudMetric label="CONF" value={`${Math.round(incident.confidence * 100)}%`} />
            <HudMetric label="STATUS" value={incident.status.toUpperCase()} />
            <HudMetric label="LVL" value={alertSeverityLabel[incident.severity].toUpperCase()} />
            <HudMetric label="SRC" value={`${incident.sourceDeviceIds.length}`} />
          </div>
        </div>
      </Popup>
      <Tooltip className="map-hover-tooltip" direction="top" opacity={1}>
        <QuickInfoCard
          title={incident.title}
          items={[
            ['SEV', alertSeverityLabel[incident.severity].toUpperCase()],
            ['STATUS', incident.status.toUpperCase()],
            ['CONF', `${Math.round(incident.confidence * 100)}%`],
            ['LAST', incident.updatedAt],
          ]}
        />
      </Tooltip>
    </CircleMarker>
  )
}

function getAlertPriority(severity: AlertSeverity): number {
  if (severity === 'critical') {
    return 2
  }

  if (severity === 'high') {
    return 1
  }

  return 0
}

function getDeviceSeverityLabel(device: Device): string {
  if (device.status === 'alarm') {
    return 'HIGH'
  }

  if (device.status === 'warning') {
    return 'MED'
  }

  if (device.status === 'offline') {
    return 'LOW'
  }

  return 'NORMAL'
}

function QuickInfoCard({ title, items }: { title: string; items: Array<[string, string]> }) {
  return (
    <div className="quick-info-card">
      <strong>{title}</strong>
      <div className="quick-info-grid">
        {items.map(([label, value]) => (
          <span className="quick-info-row" key={`${label}-${value}`}>
            <span>{label}</span>
            <strong>{value}</strong>
          </span>
        ))}
      </div>
    </div>
  )
}
