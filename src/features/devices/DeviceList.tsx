import { Badge, Field, Input, Select, Text } from '@fluentui/react-components'
import type { ChangeEvent } from 'react'
import type { Device, DeviceStatus } from '../../types/domain'
import { ListState } from '../../components/ui/ListState'
import { formatDisplayTime } from '../../utils/formatters'
import type { DashboardViewMode } from '../dashboard/dashboardViewState'
import type { DeviceStatusFilter } from './deviceFilters'
import { formatCapabilities, ingestModeLabel, profileLabel } from './deviceProfiles'

const deviceStatusColor: Record<DeviceStatus, 'success' | 'warning' | 'danger' | 'subtle'> = {
  online: 'success',
  warning: 'warning',
  alarm: 'danger',
  offline: 'subtle',
}

const deviceStatusLabel: Record<DeviceStatusFilter, string> = {
  all: 'Tumu',
  online: 'Online',
  warning: 'Uyari',
  alarm: 'Alarm',
  offline: 'Offline',
}

export type DeviceListProps = {
  devices: Device[]
  searchTerm: string
  statusFilter: DeviceStatusFilter
  viewMode: DashboardViewMode
  onSearchTermChange: (value: string) => void
  onStatusFilterChange: (status: DeviceStatusFilter) => void
}

export function DeviceList({
  devices,
  onSearchTermChange,
  onStatusFilterChange,
  searchTerm,
  statusFilter,
  viewMode,
}: DeviceListProps) {
  if (viewMode === 'loading') {
    return <ListState message="Cihazlar yukleniyor" />
  }

  if (viewMode === 'error') {
    return <ListState message="Cihazlar yuklenemedi" tone="error" />
  }

  if (viewMode === 'empty') {
    return <ListState message="Henuz bagli cihaz yok" />
  }

  function handleStatusFilterChange(event: ChangeEvent<HTMLSelectElement>) {
    onStatusFilterChange(event.target.value as DeviceStatusFilter)
  }

  return (
    <div className="stack">
      <div className="panel-filters device-filters">
        <Field label="Arama" size="small">
          <Input
            aria-label="Cihazlarda ara"
            placeholder="Ad, konum, tip"
            value={searchTerm}
            onChange={(event) => onSearchTermChange(event.target.value)}
          />
        </Field>
        <Field label="Status" size="small">
          <Select aria-label="Cihazlari status ile filtrele" value={statusFilter} onChange={handleStatusFilterChange}>
            <option value="all">{deviceStatusLabel.all}</option>
            <option value="online">{deviceStatusLabel.online}</option>
            <option value="warning">{deviceStatusLabel.warning}</option>
            <option value="alarm">{deviceStatusLabel.alarm}</option>
            <option value="offline">{deviceStatusLabel.offline}</option>
          </Select>
        </Field>
      </div>

      {devices.length === 0 ? (
        <ListState message="Bu filtrelere uyan cihaz yok" />
      ) : (
        devices.map((device) => (
          <div className="device-row" key={device.id}>
            <div>
              <Text weight="semibold">{device.name}</Text>
              <Text className="muted" size={200}>
                {device.location} / {device.rangeKm} km / {formatDisplayTime(device.lastSeen)}
              </Text>
              <Text block className="muted" size={200}>
                {profileLabel[device.profile]} / {ingestModeLabel[device.ingestMode]} / {formatCapabilities(device.capabilities)}
              </Text>
            </div>
            <Badge color={deviceStatusColor[device.status]}>{deviceStatusLabel[device.status]}</Badge>
          </div>
        ))
      )}
    </div>
  )
}
