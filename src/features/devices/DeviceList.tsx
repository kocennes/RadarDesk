import { Badge, Field, Input, Select, Text } from '@fluentui/react-components'
import type { ChangeEvent } from 'react'
import type { Device, DeviceStatus } from '../../types/domain'
import { ListState } from '../../components/ui/ListState'
import { formatDisplayTime } from '../../utils/formatters'
import type { DashboardViewMode } from '../dashboard/dashboardViewState'
import type { DeviceStatusFilter } from './deviceFilters'

const deviceStatusColor: Record<DeviceStatus, 'success' | 'warning' | 'danger' | 'subtle'> = {
  online: 'success',
  warning: 'warning',
  alarm: 'danger',
  offline: 'subtle',
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
    return <ListState message="Loading devices" />
  }

  if (viewMode === 'error') {
    return <ListState message="Devices could not be loaded" tone="error" />
  }

  if (viewMode === 'empty') {
    return <ListState message="No devices connected yet" />
  }

  function handleStatusFilterChange(event: ChangeEvent<HTMLSelectElement>) {
    onStatusFilterChange(event.target.value as DeviceStatusFilter)
  }

  return (
    <div className="stack">
      <div className="panel-filters device-filters">
        <Field label="Search" size="small">
          <Input
            aria-label="Search devices"
            placeholder="Name, location, type"
            value={searchTerm}
            onChange={(event) => onSearchTermChange(event.target.value)}
          />
        </Field>
        <Field label="Status" size="small">
          <Select aria-label="Filter devices by status" value={statusFilter} onChange={handleStatusFilterChange}>
            <option value="all">All</option>
            <option value="online">Online</option>
            <option value="warning">Warning</option>
            <option value="alarm">Alarm</option>
            <option value="offline">Offline</option>
          </Select>
        </Field>
      </div>

      {devices.length === 0 ? (
        <ListState message="No devices match these filters" />
      ) : (
        devices.map((device) => (
          <div className="device-row" key={device.id}>
            <div>
              <Text weight="semibold">{device.name}</Text>
              <Text className="muted" size={200}>
                {device.location} / {device.rangeKm} km / {formatDisplayTime(device.lastSeen)}
              </Text>
            </div>
            <Badge color={deviceStatusColor[device.status]}>{device.status}</Badge>
          </div>
        ))
      )}
    </div>
  )
}
