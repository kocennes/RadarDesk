import { Circle, CircleMarker, LayerGroup, LayersControl, MapContainer, Popup, TileLayer } from 'react-leaflet'
import type { Alert, AlertSeverity, Device } from '../../types/domain'
import { getAlertOverlays, getMapCenter, getRangeMeters, type AlertOverlay } from './mapUtils'
import 'leaflet/dist/leaflet.css'

type OperationsMapProps = {
  alerts: Alert[]
  devices: Device[]
}

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

export function OperationsMap({ alerts, devices }: OperationsMapProps) {
  const center = getMapCenter(devices)
  const alertOverlays = getAlertOverlays(alerts, devices)

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
        <LayersControl.Overlay checked name="Device markers">
          <LayerGroup>{devices.map((device) => renderDeviceMarker(device))}</LayerGroup>
        </LayersControl.Overlay>
        <LayersControl.Overlay checked name="Range rings">
          <LayerGroup>{devices.map((device) => renderRangeRing(device))}</LayerGroup>
        </LayersControl.Overlay>
        <LayersControl.Overlay checked name="Alert overlays">
          <LayerGroup>{alertOverlays.map((overlay) => renderAlertOverlay(overlay))}</LayerGroup>
        </LayersControl.Overlay>
      </LayersControl>
    </MapContainer>
  )
}

function renderDeviceMarker(device: Device) {
  const position: [number, number] = [device.latitude, device.longitude]
  const color = deviceColors[device.type]

  return (
    <CircleMarker
      center={position}
      color="#ffffff"
      fillColor={color}
      fillOpacity={1}
      key={device.id}
      radius={9}
      weight={2}
    >
      <Popup>
        {device.name}
        <br />
        Status: {device.status}
      </Popup>
    </CircleMarker>
  )
}

function renderRangeRing(device: Device) {
  const position: [number, number] = [device.latitude, device.longitude]
  const color = deviceColors[device.type]

  return (
    <Circle
      center={position}
      color={color}
      fillColor={color}
      fillOpacity={0.08}
      key={`${device.id}-range`}
      radius={getRangeMeters(device)}
      weight={2}
    >
      <Popup>
        {device.name}
        <br />
        Range: {device.rangeKm} km
      </Popup>
    </Circle>
  )
}

function renderAlertOverlay({ alert, position }: AlertOverlay) {
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
        {alert.title}
        <br />
        Severity: {alert.severity}
        <br />
        Area: {alert.area}
      </Popup>
    </CircleMarker>
  )
}
