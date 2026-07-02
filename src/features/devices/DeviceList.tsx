import { Badge, Button, Field, Input, Select, Text, Tooltip } from '@fluentui/react-components'
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

function getDeviceStatusDescription(device: Device): string {
  if (device.status === 'warning' && device.profile === 'rf-receiver') {
    return 'Uyari: RF alici mock akisinda beklenen sinyal esiginin disinda aktivite goruldu. Bu durum kisa sureli parazit, yeni bir frekans olayi veya sinyal siniflandirma belirsizligi olabilir; operator incelemesi gerekir.'
  }

  if (device.status === 'warning') {
    return 'Uyari: Cihaz veri akisinda normal disi ama kritik olmayan bir durum var. Baglanti kalitesi, son event ve cihaz sagligi kontrol edilmeli.'
  }

  if (device.status === 'alarm') {
    return 'Alarm: Cihazdan kritik olay geldi. Ilgili alarm ve kanit kayitlari operator tarafindan incelenmeli.'
  }

  if (device.status === 'offline') {
    return 'Offline: Cihazdan yeni veri alinmiyor. Baglanti kaldirilmis, ag erisimi kesilmis veya kaynak pasif olabilir.'
  }

  return 'Online: Cihaz aktif gorunuyor ve son veri zamani normal aralikta.'
}

export type DeviceListProps = {
  devices: Device[]
  searchTerm: string
  statusFilter: DeviceStatusFilter
  viewMode: DashboardViewMode
  actionDeviceId?: string
  onDeleteDevice: (device: Device) => void
  onDisconnectDevice: (device: Device) => void
  onSearchTermChange: (value: string) => void
  onStatusFilterChange: (status: DeviceStatusFilter) => void
}

export function DeviceList({
  devices,
  actionDeviceId,
  onDeleteDevice,
  onDisconnectDevice,
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
          <div className={`device-row device-status-${device.status}`} key={device.id}>
            <div>
              <Text weight="semibold">{device.name}</Text>
              <Text className="muted" size={200}>
                {device.location} / {device.rangeKm} km / {formatDisplayTime(device.lastSeen)}
              </Text>
              <Text block className="muted" size={200}>
                {profileLabel[device.profile]} / {ingestModeLabel[device.ingestMode]} / {formatCapabilities(device.capabilities)}
              </Text>
              <div className="hud-chip-row">
                <span className="hud-chip">RNG: {device.rangeKm * 1000}m</span>
                <span className="hud-chip">TYPE: {device.type.toUpperCase()}</span>
                <span className="hud-chip">STATUS: {device.status.toUpperCase()}</span>
              </div>
            </div>
            <div className="device-row-actions">
              <Tooltip content={getDeviceStatusDescription(device)} relationship="description">
                <span className="status-badge-with-info" tabIndex={0}>
                  <Badge color={deviceStatusColor[device.status]}>{deviceStatusLabel[device.status]}</Badge>
                </span>
              </Tooltip>
              <div className="device-action-buttons">
                <Button
                  appearance="secondary"
                  disabled={actionDeviceId === device.id || device.status === 'offline'}
                  size="small"
                  onClick={() => onDisconnectDevice(device)}
                >
                  Baglantiyi kaldir
                </Button>
                <Button
                  appearance="secondary"
                  className="danger-button"
                  disabled={actionDeviceId === device.id}
                  size="small"
                  onClick={() => onDeleteDevice(device)}
                >
                  Cihazi sil
                </Button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
