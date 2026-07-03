import { useState, type ChangeEvent } from 'react'
import { Badge, Button, Card, CardHeader, Text, Textarea } from '@fluentui/react-components'
import { ListState } from '../../components/ui/ListState'
import { ButtonInfo } from '../../components/ui/ButtonInfo'
import type { AlertSeverity, CommandResult, Incident, IncidentConfirmationLevel, IncidentStatus } from '../../types/domain'
import { formatDisplayTime } from '../../utils/formatters'

type IncidentListProps = {
  incidents: Incident[]
  onReviewIncident: (
    incident: Incident,
    input: {
      operatorNote?: string
      status: IncidentStatus
    },
  ) => Promise<void>
  onRequestCameraCommand?: (incident: Incident) => Promise<CommandResult>
}

const severityColor: Record<AlertSeverity, 'success' | 'warning' | 'danger' | 'subtle'> = {
  critical: 'danger',
  high: 'danger',
  low: 'subtle',
  medium: 'warning',
}

const statusLabel: Record<IncidentStatus, string> = {
  confirmed: 'Dogrulandi',
  dismissed: 'Kapatildi',
  open: 'Acik',
  reviewing: 'Incelemede',
}

const confirmationLabel: Record<IncidentConfirmationLevel, string> = {
  'multi-sensor': 'Coklu sensor',
  'operator-confirmed': 'Operator onayli',
  'single-sensor': 'Tek sensor',
}

export function IncidentList({ incidents, onRequestCameraCommand, onReviewIncident }: IncidentListProps) {
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({})
  const [commandMessages, setCommandMessages] = useState<Record<string, string>>({})
  const [pendingIncidentId, setPendingIncidentId] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string>('')

  function handleNoteChange(incidentId: string, event: ChangeEvent<HTMLTextAreaElement>) {
    setNoteDrafts((currentDrafts) => ({
      ...currentDrafts,
      [incidentId]: event.target.value,
    }))
  }

  async function handleReview(incident: Incident, status: IncidentStatus) {
    setPendingIncidentId(incident.id)
    setErrorMessage('')

    try {
      await onReviewIncident(incident, {
        operatorNote: noteDrafts[incident.id] ?? incident.operatorNote,
        status,
      })
    } catch {
      setErrorMessage('Incident incelemesi kaydedilemedi.')
    } finally {
      setPendingIncidentId('')
    }
  }

  async function handleCameraCommand(incident: Incident) {
    if (!onRequestCameraCommand) {
      return
    }

    setPendingIncidentId(incident.id)
    setErrorMessage('')

    try {
      const commandResult = await onRequestCameraCommand(incident)
      setCommandMessages((currentMessages) => ({
        ...currentMessages,
        [incident.id]: `${commandResult.safeMessage} ID: ${commandResult.command.id}`,
      }))
    } catch {
      setErrorMessage('Kamera yonlendirme istegi olusturulamadi.')
    } finally {
      setPendingIncidentId('')
    }
  }

  return (
    <Card className="incident-list-card">
      <CardHeader
        header={<Text weight="semibold">Olay dosyalari</Text>}
        description={<Text size={200}>Birden fazla sensor kaydindan uretilen incident ozetleri</Text>}
      />
      <div className="stack">
        {incidents.length === 0 ? (
          <ListState message="Henuz incident yok" />
        ) : (
          <>
            {incidents.map((incident) => {
              const noteValue = noteDrafts[incident.id] ?? incident.operatorNote ?? ''
              const isPending = pendingIncidentId === incident.id

              return (
                <article
                  className={`incident-row incident-severity-${incident.severity} incident-status-${incident.status}`}
                  key={incident.id}
                >
                  <div className="incident-content">
                    <div className="incident-summary">
                      <div>
                        <Text weight="semibold">{incident.title}</Text>
                        <Text block className="muted" size={200}>
                          {incident.sensorEventIds.length} event / {incident.sourceDeviceIds.length} cihaz /{' '}
                          {formatDisplayTime(incident.updatedAt)}
                        </Text>
                        <Text block className="muted" size={200}>
                          Guven: %{Math.round(incident.confidence * 100)} / {confirmationLabel[incident.confirmationLevel]} / Kanit:{' '}
                          {incident.evidenceRefs.length}
                        </Text>
                        <div className="hud-chip-row">
                          <span className="hud-chip">CONF: {Math.round(incident.confidence * 100)}%</span>
                          <span className="hud-chip">STATUS: {incident.status.toUpperCase()}</span>
                          <span className="hud-chip">EV: {incident.evidenceRefs.length}</span>
                        </div>
                      </div>
                      <div className="incident-badges">
                        <Badge color={severityColor[incident.severity]}>{incident.severity}</Badge>
                        <Badge appearance="outline">{confirmationLabel[incident.confirmationLevel]}</Badge>
                        <Badge appearance="outline">{statusLabel[incident.status]}</Badge>
                      </div>
                    </div>

                    <Textarea
                      aria-label={`${incident.title} operator notu`}
                      maxLength={240}
                      onChange={(event) => handleNoteChange(incident.id, event)}
                      placeholder="Operator notu"
                      resize="vertical"
                      value={noteValue}
                    />

                    {commandMessages[incident.id] ? (
                      <Text block className="form-success" size={200}>
                        {commandMessages[incident.id]}
                      </Text>
                    ) : null}

                    <div className="incident-actions">
                      <div className="button-with-info">
                        <Button disabled={isPending} onClick={() => void handleReview(incident, 'reviewing')}>
                          Incele
                        </Button>
                        <ButtonInfo label="Incident durumunu incelemede olarak isaretler ve operator notunu kaydeder." />
                      </div>
                      <div className="button-with-info">
                        <Button disabled={isPending} onClick={() => void handleReview(incident, 'confirmed')}>
                          Dogrula
                        </Button>
                        <ButtonInfo label="Incident kaydini operator tarafindan dogrulanmis olay olarak isaretler." />
                      </div>
                      <div className="button-with-info">
                        <Button disabled={isPending} onClick={() => void handleReview(incident, 'dismissed')}>
                          Kapat
                        </Button>
                        <ButtonInfo label="Incident kaydini kapatir; olay gecmisi ve evidence referanslari korunur." />
                      </div>
                      {onRequestCameraCommand ? (
                        <div className="button-with-info">
                          <Button disabled={isPending} onClick={() => void handleCameraCommand(incident)}>
                            Kamera oner
                          </Button>
                          <ButtonInfo label="Secili incident icin backend command modeli uzerinden PTZ dry-run istegi olusturur; gercek cihaza direkt komut gondermez." />
                        </div>
                      ) : null}
                    </div>
                  </div>
                </article>
              )
            })}
            {errorMessage ? (
              <Text block className="form-error" size={200}>
                {errorMessage}
              </Text>
            ) : null}
          </>
        )}
      </div>
    </Card>
  )
}
