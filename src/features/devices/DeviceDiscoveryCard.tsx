import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Badge, Button, Card, CardHeader, Field, Input, Text } from '@fluentui/react-components'
import { ListState } from '../../components/ui/ListState'
import type { Device, DiscoveredDevice } from '../../types/domain'
import type { DeviceRegistrationResult } from './deviceRegistration'
import { formatCapabilities, ingestModeLabel, profileLabel, rawSourceLabel } from './deviceProfiles'

type DeviceDiscoveryCardProps = {
  discoveredDevices: DiscoveredDevice[]
  onRegisterDevice: (input: { discoveredDeviceId: string; displayName: string }) => Promise<DeviceRegistrationResult>
  onDeviceRegistered: (device: Device) => void
}

const typeLabel: Record<DiscoveredDevice['type'], string> = {
  c2: 'C2',
  'eo-ir': 'Kamera',
  radar: 'Radar',
  rf: 'RF',
}

const connectionLabel: Record<DiscoveredDevice['connectionType'], string> = {
  network: 'Ag',
  serial: 'Seri',
  usb: 'USB',
}

export function DeviceDiscoveryCard({ discoveredDevices, onRegisterDevice, onDeviceRegistered }: DeviceDiscoveryCardProps) {
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>(discoveredDevices[0]?.id ?? '')
  const [displayName, setDisplayName] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [successMessage, setSuccessMessage] = useState<string>('')
  const selectedDevice = discoveredDevices.find((device) => device.id === selectedDeviceId)

  function handleSelectDevice(deviceId: string) {
    setSelectedDeviceId(deviceId)
    setDisplayName('')
    setErrorMessage('')
    setSuccessMessage('')
  }

  function handleDisplayNameChange(event: ChangeEvent<HTMLInputElement>) {
    setDisplayName(event.target.value)
    setErrorMessage('')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setIsSaving(true)
    const result = await onRegisterDevice({
      discoveredDeviceId: selectedDeviceId,
      displayName,
    })
    setIsSaving(false)

    if (!result.ok) {
      setErrorMessage(result.message)
      setSuccessMessage('')
      return
    }

    onDeviceRegistered(result.device)
    setSuccessMessage(`${result.device.name} cihaz listesine eklendi.`)
    setDisplayName('')
  }

  return (
    <Card className="discovery-card">
      <CardHeader
        header={<Text weight="semibold">Cihaz kesfi</Text>}
        description={<Text size={200}>Bulunan cihazi sec ve sahadaki gorevine gore adlandir</Text>}
      />

      {discoveredDevices.length === 0 ? (
        <ListState message="Algilanan cihaz yok" />
      ) : (
        <div className="discovery-layout">
          <div className="discovery-list" aria-label="Algilanan cihazlar">
            {discoveredDevices.map((device) => (
              <button
                className={`discovery-row ${device.id === selectedDeviceId ? 'discovery-row-selected' : ''}`}
                key={device.id}
                type="button"
                onClick={() => handleSelectDevice(device.id)}
              >
                <span>
                  <Text weight="semibold">{device.label}</Text>
                  <Text block className="muted" size={200}>
                    {device.model} / {connectionLabel[device.connectionType]} / {device.address}
                  </Text>
                  <Text block className="muted" size={200}>
                    {profileLabel[device.profile]} / {ingestModeLabel[device.ingestMode]} / {rawSourceLabel[device.rawSource]}
                  </Text>
                </span>
                <Badge appearance="filled">{typeLabel[device.type]}</Badge>
              </button>
            ))}
          </div>

          <form className="form-grid" onSubmit={handleSubmit}>
            <Field
              label="Cihaz adi"
              hint={selectedDevice ? `Analiz: ${formatCapabilities(selectedDevice.capabilities)}` : undefined}
              validationMessage={errorMessage}
              validationState={errorMessage ? 'error' : 'none'}
            >
              <Input
                aria-label="Secilen cihaza verilecek ad"
                disabled={!selectedDevice || isSaving}
                placeholder={
                  selectedDevice?.type === 'eo-ir' ? 'Giris Kamera' : 'Kuzeyi Izleyen Radar'
                }
                value={displayName}
                onChange={handleDisplayNameChange}
              />
            </Field>
            <Button appearance="primary" disabled={!selectedDevice || isSaving} type="submit">
              {isSaving ? 'Kaydediliyor' : 'Cihazi Kaydet'}
            </Button>
            {successMessage ? <div className="form-success">{successMessage}</div> : null}
          </form>
        </div>
      )}
    </Card>
  )
}
