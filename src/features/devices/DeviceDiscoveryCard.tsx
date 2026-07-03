import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Badge, Button, Card, CardHeader, Checkbox, Field, Input, Text } from '@fluentui/react-components'
import { ListState } from '../../components/ui/ListState'
import { ButtonInfo } from '../../components/ui/ButtonInfo'
import type { Device, DeviceType, DiscoveredDevice } from '../../types/domain'
import type { DeviceRegistrationResult } from './deviceRegistration'
import { formatCapabilities, ingestModeLabel, profileLabel, rawSourceLabel } from './deviceProfiles'

type DeviceDiscoveryCardProps = {
  discoveredDevices: DiscoveredDevice[]
  onRegisterDevice: (input: { discoveredDeviceId: string; displayName: string }) => Promise<DeviceRegistrationResult>
  onDeviceRegistered: (device: Device) => void
}

type WizardStep = 'type' | 'device' | 'name' | 'location' | 'capabilities' | 'summary'

type DeviceTypeOption = {
  type: DeviceType
  label: string
  description: string
  exampleName: string
}

const typeOptions: DeviceTypeOption[] = [
  {
    type: 'radar',
    label: 'Radar',
    description: 'Track, range ve zone alert ureten radar dugumu',
    exampleName: 'Kuzey Radar',
  },
  {
    type: 'eo-ir',
    label: 'Kamera / EO-IR',
    description: 'Snapshot, termal/gorunur frame ve hareket olayi',
    exampleName: 'Giris Kamera',
  },
  {
    type: 'rf',
    label: 'RF Receiver / SIGINT Node',
    description: 'Sinyal, frekans ve RF alarm olayi',
    exampleName: 'Arka Bahce RF Node',
  },
  {
    type: 'c2',
    label: 'C2 / Kontrol cihazi',
    description: 'Komut ve cihaz durum olayi',
    exampleName: 'Kontrol Merkezi',
  },
]

const typeLabel: Record<DeviceType, string> = {
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

const statusLabel: Record<DiscoveredDevice['status'], string> = {
  available: 'Kullanilabilir',
  configured: 'Config hazir',
}

const stepLabel: Record<WizardStep, string> = {
  type: 'Tip',
  device: 'Cihaz',
  name: 'Ad',
  location: 'Konum',
  capabilities: 'Yetenek',
  summary: 'Ozet',
}

const steps: WizardStep[] = ['type', 'device', 'name', 'location', 'capabilities', 'summary']

export function DeviceDiscoveryCard({ discoveredDevices, onRegisterDevice, onDeviceRegistered }: DeviceDiscoveryCardProps) {
  const firstType = discoveredDevices[0]?.type ?? 'eo-ir'
  const [selectedType, setSelectedType] = useState<DeviceType>(firstType)
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>(getFirstDeviceId(discoveredDevices, firstType))
  const [displayName, setDisplayName] = useState<string>('')
  const [currentStep, setCurrentStep] = useState<WizardStep>('type')
  const [capabilitiesConfirmed, setCapabilitiesConfirmed] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [successMessage, setSuccessMessage] = useState<string>('')
  const filteredDevices = discoveredDevices.filter((device) => device.type === selectedType)
  const selectedDevice = discoveredDevices.find((device) => device.id === selectedDeviceId)
  const selectedTypeOption = typeOptions.find((option) => option.type === selectedType) ?? typeOptions[1]
  const canContinue = getStepCanContinue(currentStep, selectedDevice, displayName, capabilitiesConfirmed)
  const currentStepIndex = steps.indexOf(currentStep)

  function handleSelectType(type: DeviceType) {
    setSelectedType(type)
    setSelectedDeviceId(getFirstDeviceId(discoveredDevices, type))
    setDisplayName('')
    setCapabilitiesConfirmed(false)
    setErrorMessage('')
    setSuccessMessage('')
  }

  function handleSelectDevice(deviceId: string) {
    setSelectedDeviceId(deviceId)
    setDisplayName('')
    setCapabilitiesConfirmed(false)
    setErrorMessage('')
    setSuccessMessage('')
  }

  function handleDisplayNameChange(event: ChangeEvent<HTMLInputElement>) {
    setDisplayName(event.target.value)
    setErrorMessage('')
  }

  function goNext() {
    if (!canContinue) {
      setErrorMessage(getStepErrorMessage(currentStep))
      return
    }

    setErrorMessage('')
    setCurrentStep(steps[Math.min(currentStepIndex + 1, steps.length - 1)])
  }

  function goBack() {
    setErrorMessage('')
    setCurrentStep(steps[Math.max(currentStepIndex - 1, 0)])
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!selectedDevice || !capabilitiesConfirmed) {
      setErrorMessage('Kurulum ozeti tamamlanmadan cihaz kaydedilemez.')
      return
    }

    setIsSaving(true)
    const result = await onRegisterDevice({
      discoveredDeviceId: selectedDevice.id,
      displayName,
    })
    setIsSaving(false)

    if (!result.ok) {
      setErrorMessage(result.message)
      setSuccessMessage('')
      return
    }

    onDeviceRegistered(result.device)
    setSuccessMessage(`${result.device.name} kaydedildi ve operasyon panellerine eklendi.`)
    setDisplayName('')
    setCapabilitiesConfirmed(false)
    setCurrentStep('type')
  }

  return (
    <Card className="discovery-card">
      <CardHeader
        header={<Text weight="semibold">Cihaz kurulum sihirbazi</Text>}
        description={<Text size={200}>Tipi sec, guvenli discovery kaydini onayla ve saha adiyla kaydet</Text>}
      />

      {discoveredDevices.length === 0 ? (
        <ListState message="Algilanan veya config'ten gelen cihaz yok" />
      ) : (
        <form className="wizard-layout" onSubmit={handleSubmit}>
          <div className="wizard-steps" aria-label="Kurulum adimlari">
            {steps.map((step, index) => (
              <span className={`wizard-step ${index === currentStepIndex ? 'wizard-step-active' : ''}`} key={step}>
                {stepLabel[step]}
              </span>
            ))}
          </div>

          {currentStep === 'type' ? (
            <section className="wizard-section" aria-label="Cihaz tipi secimi">
              <div className="device-type-grid">
                {typeOptions.map((option) => {
                  const availableCount = discoveredDevices.filter((device) => device.type === option.type).length

                  return (
                    <button
                      className={`device-type-option ${option.type === selectedType ? 'device-type-option-selected' : ''}`}
                      key={option.type}
                      type="button"
                      onClick={() => handleSelectType(option.type)}
                    >
                      <span>
                        <Text weight="semibold">{option.label}</Text>
                        <Text block className="muted" size={200}>
                          {option.description}
                        </Text>
                      </span>
                      <Badge appearance="filled">{availableCount}</Badge>
                    </button>
                  )
                })}
              </div>
            </section>
          ) : null}

          {currentStep === 'device' ? (
            <section className="wizard-section" aria-label="Algilanan cihaz secimi">
              {filteredDevices.length === 0 ? (
                <ListState message={`${selectedTypeOption.label} icin guvenli discovery kaydi yok`} />
              ) : (
                <div className="discovery-list">
                  {filteredDevices.map((device) => (
                    <button
                      className={`discovery-row ${device.id === selectedDeviceId ? 'discovery-row-selected' : ''}`}
                      key={device.id}
                      type="button"
                      onClick={() => handleSelectDevice(device.id)}
                    >
                      <span>
                        <Text weight="semibold">{device.model}</Text>
                        <Text block className="muted" size={200}>
                          {typeLabel[device.type]} / {connectionLabel[device.connectionType]} / {statusLabel[device.status]}
                        </Text>
                        <Text block className="muted" size={200}>
                          {profileLabel[device.profile]} / {ingestModeLabel[device.ingestMode]} / {rawSourceLabel[device.rawSource]}
                        </Text>
                      </span>
                      <Badge appearance="filled">{typeLabel[device.type]}</Badge>
                    </button>
                  ))}
                </div>
              )}
            </section>
          ) : null}

          {currentStep === 'name' ? (
            <section className="wizard-section" aria-label="Saha adi verme">
              <Field
                label="Saha cihazi adi"
                hint={`Ornek: ${selectedTypeOption.exampleName}. Tip, profil ve yetenekler discovery kaydindan gelir.`}
                validationMessage={errorMessage}
                validationState={errorMessage ? 'error' : 'none'}
              >
                <Input
                  aria-label="Secilen cihaza verilecek saha adi"
                  disabled={!selectedDevice || isSaving}
                  placeholder={selectedTypeOption.exampleName}
                  value={displayName}
                  onChange={handleDisplayNameChange}
                />
              </Field>
              {selectedDevice ? <SafeDeviceSummary device={selectedDevice} /> : null}
            </section>
          ) : null}

          {currentStep === 'location' ? (
            <section className="wizard-section" aria-label="Konumlandirma">
              <div className="wizard-info-panel">
                <Text weight="semibold">Mock/default konum</Text>
                <Text block className="muted" size={200}>
                  Ilk surumde cihaz varsayilan egitim koordinatina eklenir. Gercek musteri veya saha koordinati kullanilmaz.
                </Text>
                <Text block size={200}>
                  Konum: Konum atanacak / 41.006, 28.976
                </Text>
              </div>
            </section>
          ) : null}

          {currentStep === 'capabilities' ? (
            <section className="wizard-section" aria-label="Cihaz yeteneklerini onaylama">
              {selectedDevice ? (
                <div className="wizard-info-panel">
                  <Text weight="semibold">{typeLabel[selectedDevice.type]} yetenekleri</Text>
                  <div className="capability-list">
                    {selectedDevice.capabilities.map((capability) => (
                      <Badge appearance="filled" key={capability}>
                        {capability}
                      </Badge>
                    ))}
                  </div>
                  <Checkbox
                    checked={capabilitiesConfirmed}
                    label="Yeteneklerin cihaz discovery/config kaydindan geldigini onayliyorum"
                    onChange={(_, data) => {
                      setCapabilitiesConfirmed(data.checked === true)
                      setErrorMessage('')
                    }}
                  />
                </div>
              ) : null}
            </section>
          ) : null}

          {currentStep === 'summary' ? (
            <section className="wizard-section" aria-label="Ozet ve kaydetme">
              {selectedDevice ? (
                <div className="setup-summary">
                  <SummaryRow label="Cihaz adi" value={displayName.trim()} />
                  <SummaryRow label="Tip" value={typeLabel[selectedDevice.type]} />
                  <SummaryRow label="Model" value={selectedDevice.model} />
                  <SummaryRow label="Baglanti" value={connectionLabel[selectedDevice.connectionType]} />
                  <SummaryRow label="Durum" value={statusLabel[selectedDevice.status]} />
                  <SummaryRow label="Konum" value="Mock/default koordinat" />
                  <SummaryRow label="Yetenekler" value={formatCapabilities(selectedDevice.capabilities)} />
                </div>
              ) : null}
            </section>
          ) : null}

          {errorMessage && currentStep !== 'name' ? <Text className="form-error">{errorMessage}</Text> : null}
          {successMessage ? <div className="form-success">{successMessage}</div> : null}

          <div className="wizard-actions">
            <div className="button-with-info">
              <Button disabled={currentStepIndex === 0 || isSaving} type="button" onClick={goBack}>
                Geri
              </Button>
              <ButtonInfo label="Kurulum sihirbazinda bir onceki adima doner; girilen bilgiler korunur." />
            </div>
            {currentStep === 'summary' ? (
              <div className="button-with-info">
                <Button appearance="primary" disabled={!canContinue || isSaving} type="submit">
                  {isSaving ? 'Kaydediliyor' : 'Kaydet'}
                </Button>
                <ButtonInfo label="Secilen discovery cihazini verilen saha adi ve guvenli mock konumla kayitli cihazlara ekler." />
              </div>
            ) : (
              <div className="button-with-info">
                <Button appearance="primary" disabled={!canContinue || isSaving} type="button" onClick={goNext}>
                  Ileri
                </Button>
                <ButtonInfo label="Mevcut adim dogrulamasini gecerse kurulum sihirbazinda sonraki adima ilerler." />
              </div>
            )}
          </div>
        </form>
      )}
    </Card>
  )
}

function SafeDeviceSummary({ device }: { device: DiscoveredDevice }) {
  return (
    <div className="wizard-info-panel">
      <Text weight="semibold">Secilen cihaz</Text>
      <Text block className="muted" size={200}>
        {device.model} / {typeLabel[device.type]} / {connectionLabel[device.connectionType]} / {statusLabel[device.status]}
      </Text>
      <Text block className="muted" size={200}>
        {profileLabel[device.profile]} / {formatCapabilities(device.capabilities)}
      </Text>
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="setup-summary-row">
      <Text className="muted" size={200}>
        {label}
      </Text>
      <Text weight="semibold">{value}</Text>
    </div>
  )
}

function getFirstDeviceId(discoveredDevices: DiscoveredDevice[], type: DeviceType): string {
  return discoveredDevices.find((device) => device.type === type)?.id ?? ''
}

function getStepCanContinue(
  step: WizardStep,
  selectedDevice: DiscoveredDevice | undefined,
  displayName: string,
  capabilitiesConfirmed: boolean,
): boolean {
  if (step === 'device') {
    return Boolean(selectedDevice)
  }

  if (step === 'name') {
    return Boolean(selectedDevice) && displayName.trim().length >= 2
  }

  if (step === 'capabilities' || step === 'summary') {
    return Boolean(selectedDevice) && displayName.trim().length >= 2 && capabilitiesConfirmed
  }

  return true
}

function getStepErrorMessage(step: WizardStep): string {
  if (step === 'device') {
    return 'Once guvenli discovery listesinden bir cihaz secilmelidir.'
  }

  if (step === 'name') {
    return 'Cihaz adi en az 2 karakter olmalidir.'
  }

  if (step === 'capabilities') {
    return 'Cihaz yetenekleri onaylanmalidir.'
  }

  return 'Kurulum adimi tamamlanmalidir.'
}
