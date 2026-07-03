import { Button, Card, CardHeader, Text } from '@fluentui/react-components'
import { useState } from 'react'
import { ButtonInfo } from '../../components/ui/ButtonInfo'
import type { CameraFeed, Device, SensorEvent } from '../../types/domain'
import type { SensorEventIngestInput } from '../../services/apiClient'

type SensorEventTesterProps = {
  cameraFeeds: CameraFeed[]
  devices: Device[]
  onCreateEvent: (input: SensorEventIngestInput) => Promise<SensorEvent>
  onEventCreated: (event: SensorEvent) => void
}

type TestEventKey = 'thermal' | 'radar' | 'rf' | 'c2'

type TestEventOption = {
  key: TestEventKey
  label: string
  description: string
  input: SensorEventIngestInput | undefined
}

export function SensorEventTester({
  cameraFeeds,
  devices,
  onCreateEvent,
  onEventCreated,
}: SensorEventTesterProps) {
  const [pendingKey, setPendingKey] = useState<TestEventKey | null>(null)
  const [statusMessage, setStatusMessage] = useState<string>('Hazir')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const cameraFeed = cameraFeeds.find((candidate) => candidate.status !== 'offline')
  const radarDevice = devices.find((candidate) => candidate.type === 'radar')
  const rfDevice = devices.find((candidate) => candidate.type === 'rf')
  const c2Device = devices.find((candidate) => candidate.type === 'c2')

  const options: TestEventOption[] = [
    {
      key: 'thermal',
      label: 'Termal test',
      description: cameraFeed
        ? `${cameraFeed.name} icin otomatik snapshot kaniti`
        : 'Uygun kamera feed yok',
      input: cameraFeed
        ? {
            cameraFeedId: cameraFeed.id,
            deviceId: cameraFeed.deviceId,
            kind: 'thermal-motion',
            metadata: {
              area: cameraFeed.fieldOfView,
              confidence: 0.88,
              source: 'frontend-test-control',
            },
            severity: 'high',
          }
        : undefined,
    },
    {
      key: 'radar',
      label: 'Radar test',
      description: radarDevice ? `${radarDevice.name} icin track metadata` : 'Uygun radar yok',
      input: radarDevice
        ? {
            deviceId: radarDevice.id,
            kind: 'radar-track',
            metadata: {
              bearingDeg: 32,
              rangeM: 350,
              speedMps: 6,
              trackId: 'T-TEST-001',
            },
            severity: 'medium',
          }
        : undefined,
    },
    {
      key: 'rf',
      label: 'RF test',
      description: rfDevice ? `${rfDevice.name} icin sinyal metadata` : 'Uygun RF cihazi yok',
      input: rfDevice
        ? {
            deviceId: rfDevice.id,
            kind: 'rf-signal',
            metadata: {
              durationSec: 3,
              frequencyMhz: 2450,
              signalDbm: -55,
            },
            severity: 'medium',
          }
        : undefined,
    },
    {
      key: 'c2',
      label: 'C2 test',
      description: c2Device ? `${c2Device.name} icin cihaz durum metadata` : 'Uygun C2 cihazi yok',
      input: c2Device
        ? {
            deviceId: c2Device.id,
            kind: 'device-state',
            metadata: {
              commandState: 'ready',
              linkedDevices: devices.filter((device) => device.status !== 'offline').length,
              source: 'frontend-test-control',
            },
            severity: 'low',
          }
        : undefined,
    },
  ]

  async function handleCreateEvent(option: TestEventOption) {
    if (!option.input) {
      return
    }

    setPendingKey(option.key)
    setErrorMessage('')
    setStatusMessage('Backend ingest deneniyor')

    try {
      const event = await onCreateEvent(option.input)
      onEventCreated(event)
      setStatusMessage(`${option.label} olayi kaydedildi`)
    } catch {
      setErrorMessage('Test olayi kaydedilemedi.')
      setStatusMessage('Hata')
    } finally {
      setPendingKey(null)
    }
  }

  return (
    <Card>
      <CardHeader
        header={<Text weight="semibold">Test olay uret</Text>}
        description={<Text size={200}>Gercek veri gelmeden backend ingest akisini dener</Text>}
      />
      <div className="event-test-actions">
        {options.map((option) => (
          <div className="button-with-info" key={option.key}>
            <Button
              appearance="secondary"
              disabled={!option.input || pendingKey !== null}
              onClick={() => void handleCreateEvent(option)}
            >
              {pendingKey === option.key ? 'Kaydediliyor' : option.label}
            </Button>
            <ButtonInfo label={getTestEventButtonDescription(option)} />
          </div>
        ))}
      </div>
      <div className="stack">
        {options.map((option) => (
          <Text block className="muted" key={option.key} size={200}>
            {option.description}
          </Text>
        ))}
        <Text block className={errorMessage ? 'form-error' : 'muted'} size={200}>
          {errorMessage || statusMessage}
        </Text>
      </div>
    </Card>
  )
}

function getTestEventButtonDescription(option: TestEventOption): string {
  if (!option.input) {
    return option.description
  }

  return `${option.label} backend ingest akisina ${option.input.kind} tipinde mock sensor olayi gonderir.`
}
