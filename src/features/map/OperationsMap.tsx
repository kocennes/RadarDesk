import { Circle, CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet'
import type { Device } from '../../types/domain'
import { getMapCenter, getRangeMeters } from './mapUtils'
import 'leaflet/dist/leaflet.css'

type OperationsMapProps = {
  devices: Device[]
}

const deviceColors: Record<Device['type'], string> = {
  radar: '#c50f1f',
  rf: '#f59e0b',
  'eo-ir': '#2563eb',
  c2: '#107c10',
}

export function OperationsMap({ devices }: OperationsMapProps) {
  const center = getMapCenter(devices)

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

      {devices.map((device) => {
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
      })}

      {devices.map((device) => {
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
      })}
    </MapContainer>
  )
}
