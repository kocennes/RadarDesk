import { Fragment, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Circle, CircleMarker, MapContainer, Polyline, Popup, TileLayer, Tooltip } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { severityFromRadarTrack } from './c2Ingestion'
import { initialIncidents, siteOrigin } from './c2MockData'
import type {
  AlarmLog,
  CameraCommandMetadata,
  CameraEvidenceEvent,
  DashboardState,
  DeviceListRow,
  IngestKind,
  IncidentFolder,
  NormalizedSensorEvent,
  RadarTrackEvent,
  SIGINTDetectionEvent,
  SlewToCueState,
  TabKey,
} from './c2Types'
import { useC2IngestionState } from './useC2IngestionState'
import './NexusC2Dashboard.css'

export default function NexusC2Dashboard() {
  const [dashboardState, setDashboardState] = useState<DashboardState>('success')
  const [activeTab, setActiveTab] = useState<TabKey>('alerts')
  const [now, setNow] = useState<Date>(() => new Date())
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [selectedCameraId, setSelectedCameraId] = useState('BIS-CAM-02')
  const {
    alarms,
    cameraCommand,
    cameraEvidences,
    dispatchMockIngest,
    latestCameraEvidence,
    normalizedEvents,
    radarTracks,
    requestCameraSuggestion,
    sigintEvents,
    slewToCueState,
    stats,
    visibleDevices,
  } = useC2IngestionState(dashboardState)

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(new Date()), 1000)

    return () => window.clearInterval(intervalId)
  }, [])

  const cameraDevices = visibleDevices.filter((device) => device.protocol === 'RTSP_H264')
  const selectedCamera = cameraDevices.find((device) => device.id === selectedCameraId) ?? cameraDevices[0]
  const selectedCameraEvidences = selectedCamera
    ? cameraEvidences.filter((evidenceItem) => evidenceItem.device_id === selectedCamera.id)
    : cameraEvidences
  const activeRadarTracks = radarTracks.filter((track) => isWithinLast24Hours(track.timestamp, now))
  const archivedRadarTracks = radarTracks.filter((track) => !isWithinLast24Hours(track.timestamp, now))
  const activeSigintEvents = sigintEvents.filter((event) => isWithinLast24Hours(event.timestamp, now))
  const archivedSigintEvents = sigintEvents.filter((event) => !isWithinLast24Hours(event.timestamp, now))
  const activeCameraEvidences = selectedCameraEvidences.filter((evidenceItem) => isWithinLast24Hours(evidenceItem.start_time, now))
  const archivedCameraEvidences = selectedCameraEvidences.filter((evidenceItem) => !isWithinLast24Hours(evidenceItem.start_time, now))
  const selectedCameraEvidence = activeCameraEvidences[0] ?? selectedCameraEvidences[0] ?? latestCameraEvidence

  return (
    <main className="c2-shell">
      <Topbar
        dashboardState={dashboardState}
        isProfileOpen={isProfileOpen}
        now={now}
        onProfileToggle={() => setIsProfileOpen((current) => !current)}
        onStateChange={setDashboardState}
      />

      <section className="c2-metrics" aria-label="KPI kartlari">
        <MetricCard label="Toplam Cihaz" value={stats.totalDevices} tone="neutral" />
        <MetricCard label="Online Cihaz" value={stats.onlineDevices} tone="success" />
        <MetricCard label="Aktif Alarm" value={stats.activeAlarms} tone="warning" />
        <MetricCard label="Kritik Tehdit" value={stats.criticalThreats} tone="danger" pulse />
      </section>

      <section className="c2-main-grid" aria-label="Ana calisma alani">
        <aside className="c2-left-column">
          <DeviceList devices={visibleDevices} now={now} />
        </aside>

        <section className="c2-map-card" aria-label="Taktik harita">
          <OperationsMap
            dashboardState={dashboardState}
            devices={visibleDevices}
            radarTracks={dashboardState === 'empty' ? [] : activeRadarTracks}
            sigintEvents={activeSigintEvents}
          />
        </section>

        <CameraFeedCard
          cameraDevices={cameraDevices}
          commandMetadata={cameraCommand}
          evidence={selectedCameraEvidence}
          archivedEvidences={archivedCameraEvidences}
          evidences={activeCameraEvidences}
          onSuggestCamera={requestCameraSuggestion}
          onSelectCamera={setSelectedCameraId}
          selectedCameraId={selectedCamera?.id ?? selectedCameraId}
          slewToCueState={slewToCueState}
        />
      </section>

      <section className="c2-alerts-grid" aria-label="Alarm ve olay akisi">
        <AlarmFeedCard alarms={alarms} />
        <section className="c2-card c2-tabs-card">
          <div className="c2-tabs" role="tablist" aria-label="Alarm ve olay dosyalari">
            <div className="c2-tab-control">
              <button className={`c2-tab-button ${activeTab === 'alerts' ? 'is-active' : ''}`} onClick={() => setActiveTab('alerts')} type="button">
                Alerts
              </button>
              <button
                aria-label="Alerts bilgi"
                className="c2-info c2-tab-info"
                data-info="Alerts, radar/RF/kamera korelasyonundan uretilen anlik operasyon uyarilaridir. Operatorun hizli risk takibi icindir."
                type="button"
              >
                i
              </button>
            </div>
            <div className="c2-tab-control">
              <button className={`c2-tab-button ${activeTab === 'incidents' ? 'is-active' : ''}`} onClick={() => setActiveTab('incidents')} type="button">
                Incidents
              </button>
              <button
                aria-label="Incidents bilgi"
                className="c2-info c2-tab-info"
                data-info="Incidents, birden fazla uyari ve kanitin ayni olay dosyasi altinda toplandigi inceleme kayitlaridir."
                type="button"
              >
                i
              </button>
            </div>
          </div>
          {activeTab === 'alerts' ? <AlertList alarms={alarms} /> : <IncidentList incidents={initialIncidents} />}
        </section>
      </section>

      <section className="c2-secondary-grid" aria-label="Teknik lab ve sinyal analizi">
        <RadarPpiPanel archivedRadarTracks={archivedRadarTracks} radarTracks={activeRadarTracks} />
        <section className="c2-lab-column">
          <SensorEventTester onCreateEvent={dispatchMockIngest} />
          <SensorEventList normalizedEvents={normalizedEvents} />
        </section>
        <RfTimeline archivedSigintEvents={archivedSigintEvents} sigintEvents={activeSigintEvents} />
      </section>

      <section className="c2-admin-grid" aria-label="Kurulum ve saha yonetimi">
        <ProjectIntakeCard />
        <DeviceDiscoveryCard />
        <section className="c2-card c2-admin-note-card">
          <PanelTitle
            info="Operasyon icin kritik olmayan proje ve kurulum islerinin neden ilk ekrandan asagi alindigini aciklar."
            subtitle="Ilk ekrandan bilincli olarak asagi alindi"
            title="Yonetim Notu"
          />
          <p>
            Operasyon ekraninin ilk bakista harita, alarm, kamera ve cihaz durumuna odaklanmasi icin proje girisi ve
            cihaz kesif sihirbazi bu kaydirilabilir alanda tutulur.
          </p>
        </section>
      </section>
    </main>
  )
}

function Topbar({
  dashboardState,
  isProfileOpen,
  now,
  onProfileToggle,
  onStateChange,
}: {
  dashboardState: DashboardState
  isProfileOpen: boolean
  now: Date
  onProfileToggle: () => void
  onStateChange: (state: DashboardState) => void
}) {
  return (
    <header className="c2-topbar">
      <section className="c2-brand">
        <div className="c2-logo-slot" aria-label="BISAVUNMA logo alani">
          B
        </div>
        <div className="c2-brand-text">
          <strong>BISAVUNMA</strong>
          <span>NEXUS C2 - Hybrid Control System</span>
        </div>
      </section>

      <section className="c2-topbar-center">
        <select aria-label="Aktif proje">
          <option>Training Perimeter / Local Hybrid Ops</option>
          <option>City Safe Corridor / Civil Systems</option>
        </select>
        <div className="c2-state-toolbar" aria-label="StateToolbar">
          {(['success', 'loading', 'error', 'empty'] as DashboardState[]).map((state) => (
            <button className={dashboardState === state ? 'is-active' : ''} key={state} onClick={() => onStateChange(state)} type="button">
              {state[0].toUpperCase() + state.slice(1)}
            </button>
          ))}
        </div>
      </section>

      <section className="c2-topbar-actions">
        <div className="c2-clock" aria-label="Dijital saat">
          <span>LOCAL {formatClock(now)}</span>
          <strong>UTC {formatClock(now, 'UTC')}Z</strong>
        </div>
        <div className="c2-profile-menu">
          <button onClick={onProfileToggle} type="button">
            Operator
          </button>
          {isProfileOpen ? (
            <div className="c2-profile-popover" role="menu">
              <button type="button">Cikis Yap</button>
            </div>
          ) : null}
        </div>
      </section>
    </header>
  )
}

function MetricCard({ label, pulse, tone, value }: { label: string; pulse?: boolean; tone: 'neutral' | 'success' | 'warning' | 'danger'; value: number }) {
  return (
    <article className={`c2-metric c2-metric-${tone}`}>
      <span>{label}</span>
      <strong className={pulse ? 'is-pulsing' : ''}>{value}</strong>
    </article>
  )
}

function ProjectIntakeCard() {
  return (
    <section className="c2-card c2-project-card">
      <PanelTitle
        info="Proje adi, musteri ve saha bilgilerini tutan kurulum karti. Canli operasyon kararindan cok idari baglam icindir."
        subtitle="Proje, musteri ve saha taslagi"
        title="ProjectIntakeCard"
      />
      <form className="c2-form-grid">
        <label>
          Proje Adi
          <input defaultValue="Hybrid Test Range" />
        </label>
        <label>
          Musteri
          <input defaultValue="BISAVUNMA Demo" />
        </label>
        <label>
          Saha
          <input defaultValue="Local mock site" />
        </label>
        <button type="button">Kaydet</button>
      </form>
    </section>
  )
}

function DeviceDiscoveryCard() {
  return (
    <section className="c2-card c2-discovery-card">
      <PanelTitle
        info="Yeni radar, RF, kamera veya sivil sensoru bulma ve kaydetme akisini temsil eden cihaz ekleme sihirbazi."
        subtitle="Tip sec, kesfet, adlandir, kaydet"
        title="DeviceDiscoveryCard"
      />
      <div className="c2-steps">
        {['TYPE', 'DISCOVER', 'NAME', 'SAVE'].map((step, index) => (
          <span className={index === 1 ? 'is-active' : ''} key={step}>
            {step}
          </span>
        ))}
      </div>
      <div className="c2-device-type-grid">
        {['Radar', 'RF', 'Termal', 'Plaka'].map((item) => (
          <button key={item} type="button">
            {item}
          </button>
        ))}
      </div>
    </section>
  )
}

function DeviceList({ devices, now }: { devices: DeviceListRow[]; now: Date }) {
  return (
    <section className="c2-card c2-device-card">
      <PanelTitle
        info="Sahadaki aktif cihazlari teknik kimlik, model, protokol, frekans ve calisma suresiyle listeler."
        subtitle="5 satir gorunur, sonrasi kart icinde akar"
        title="DeviceListCard"
      />
      <div className="c2-table-scroll c2-scroll">
        <table className="c2-device-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Model No</th>
              <th>Protocol</th>
              <th>Freq</th>
              <th>Uptime Duration</th>
            </tr>
          </thead>
          <tbody>
            {devices.length === 0 ? (
              <tr>
                <td colSpan={5}>Aktif cihaz yok.</td>
              </tr>
            ) : (
              devices.map((device) => (
                <tr key={device.id}>
                  <td>
                    <strong>{device.id}</strong>
                    <span>{device.name}</span>
                  </td>
                  <td>{device.model_no}</td>
                  <td>{device.protocol}</td>
                  <td>{device.active_frequency}</td>
                  <td>
                    <StatusBadge status={device.status} /> {formatUptime(device.started_at, now)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function OperationsMap({
  dashboardState,
  devices,
  radarTracks,
  sigintEvents,
}: {
  dashboardState: DashboardState
  devices: DeviceListRow[]
  radarTracks: RadarTrackEvent[]
  sigintEvents: SIGINTDetectionEvent[]
}) {
  const plots = radarTracks.map((track) => radarToMapPlot(track))
  const center: [number, number] = [siteOrigin.latitude, siteOrigin.longitude]
  const deviceMarkers = devices.map((device, index) => ({
    device,
    position: getBearingEndpoint(center, index * 48, 95 + (index % 2) * 65),
  }))

  return (
    <div className="c2-map-surface">
      <MapContainer center={center} className="c2-leaflet-map" scrollWheelZoom zoom={16} zoomControl>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Circle center={center} color="#00e5ff" fillColor="#00e5ff" fillOpacity={0.035} opacity={0.38} radius={900} weight={2} />
        <Circle center={center} color="#00e5ff" fillColor="#00e5ff" fillOpacity={0.025} opacity={0.26} radius={1500} weight={1} />
        {deviceMarkers.map(({ device, position }) => (
          <CircleMarker
            center={position}
            color={device.status === 'offline' ? '#6b7280' : '#00e5ff'}
            fillColor={device.status === 'alarm' ? '#ff3b4f' : device.status === 'warning' ? '#ffb300' : '#14ff89'}
            fillOpacity={0.9}
            key={device.id}
            radius={6}
            weight={2}
          >
            <Tooltip className="c2-map-tooltip" direction="top" offset={[0, -8]} opacity={1} sticky>
              <div className="c2-map-popup">
                <strong>{device.id}</strong>
                <span>{device.name}</span>
                <span>{device.model_no}</span>
                <span>{device.protocol} / {device.active_frequency}</span>
                <span>STATUS {device.status.toUpperCase()}</span>
              </div>
            </Tooltip>
          </CircleMarker>
        ))}
        {sigintEvents.slice(0, 5).map((event) => {
          const endpoint = getBearingEndpoint(center, event.direction_of_arrival_deg, 1500)

          return (
            <Polyline
              color="#ffb300"
              dashArray="8 8"
              key={`${event.device_id}-${event.center_frequency_mhz}-${event.direction_of_arrival_deg}`}
              opacity={0.72}
              positions={[center, endpoint]}
              weight={2}
            />
          )
        })}
        {plots.map((plot) => {
          const severity = severityFromRadarTrack(plot.track)
          const color = severity === 'critical' || severity === 'high' ? '#ff3b4f' : '#ffb300'
          const position: [number, number] = [plot.track.latitude, plot.track.longitude]
          const endpoint = getBearingEndpoint(position, plot.track.heading_degrees, Math.max(160, plot.track.velocity_mps * 22))

          return (
            <Fragment key={plot.track.target_id}>
              <CircleMarker center={position} color="#ffffff" fillColor={color} fillOpacity={0.95} radius={7} weight={2}>
                <Tooltip className="c2-map-tooltip" direction="top" offset={[0, -10]} opacity={1} sticky>
                  <div className="c2-map-popup">
                    <strong>{plot.track.device_id}</strong>
                    <span>{plot.track.model_no}</span>
                    <span>{plot.track.protocol}</span>
                    <span>TRACK {plot.track.target_id}</span>
                    <span>{plot.track.velocity_mps}m/s / ALT {plot.track.altitude_meters}m</span>
                  </div>
                </Tooltip>
                <Popup>
                  <div className="c2-map-popup">
                    <strong>{plot.track.target_id}</strong>
                    <span>{plot.track.protocol}</span>
                    <span>{plot.track.velocity_mps}m/s / RCS {plot.track.rcs_dbsm}dBsm</span>
                  </div>
                </Popup>
              </CircleMarker>
              <Polyline color={color} opacity={0.82} positions={[position, endpoint]} weight={3} />
            </Fragment>
          )
        })}
      </MapContainer>
      <div className="c2-map-grid-overlay" aria-hidden="true" />
      <div className="c2-map-hud">OperationsMap / ASTERIX vectors / RF DOA</div>
      {dashboardState === 'loading' ? <MapOverlay tone="cyan" text="MAP DATA LOADING" /> : null}
      {dashboardState === 'error' ? <MapOverlay tone="red" text="TACTICAL MAP ERROR" /> : null}
      {dashboardState === 'empty' ? <MapOverlay tone="cyan" text="NO ACTIVE DEVICE" /> : null}
    </div>
  )
}

function CameraFeedCard({
  archivedEvidences,
  cameraDevices,
  commandMetadata,
  evidence,
  evidences,
  onSelectCamera,
  onSuggestCamera,
  selectedCameraId,
  slewToCueState,
}: {
  archivedEvidences: CameraEvidenceEvent[]
  cameraDevices: DeviceListRow[]
  commandMetadata: CameraCommandMetadata | undefined
  evidence: CameraEvidenceEvent | undefined
  evidences: CameraEvidenceEvent[]
  onSelectCamera: (cameraId: string) => void
  onSuggestCamera: () => void
  selectedCameraId: string
  slewToCueState: SlewToCueState
}) {
  const [isEvidenceOpen, setIsEvidenceOpen] = useState(false)
  const [isCameraPickerOpen, setIsCameraPickerOpen] = useState(false)
  const selectedCamera = cameraDevices.find((device) => device.id === selectedCameraId)

  return (
    <section className="c2-card c2-camera-card">
      <PanelTitle
        info="EO/IR veya gunduz kamera goruntusunun durumunu, FOV bilgisini, algilanan sinifi ve guven skorunu gosterir. Kamera Oner butonu sadece backend icin dry-run komut metadatasi uretir."
        subtitle="RTSP_H264 evidence metadata"
        title="CameraFeedCard"
      />
      <div className="c2-camera-body">
        <div className="c2-camera-frame">
          <div className="c2-camera-reticle" />
          <span className="c2-camera-fov">FOV {evidence?.fov_horizontal_deg ?? 42} deg / {evidence?.imaging_mode ?? 'THERMAL_IR'}</span>
          <span className="c2-camera-mode">CONF {Math.round((evidence?.confidence_score ?? 0) * 100)}%</span>
          <span className="c2-camera-class">{evidence?.threat_classification ?? 'NO_TARGET'}</span>
        </div>
        <CameraEvidenceRail evidences={evidences} onOpen={() => setIsEvidenceOpen(true)} />
      </div>
      <div className="c2-camera-actions">
        <button className="c2-primary-button" onClick={onSuggestCamera} type="button">
          Kamera Oner
        </button>
        <button className="c2-secondary-button" onClick={() => setIsCameraPickerOpen((current) => !current)} type="button">
          Kameralar
        </button>
        <button className="c2-secondary-button" onClick={() => setIsEvidenceOpen((current) => !current)} type="button">
          Evidence
        </button>
      </div>
      {isCameraPickerOpen ? (
        <CameraPickerPanel
          cameraDevices={cameraDevices}
          onClose={() => setIsCameraPickerOpen(false)}
          onSelectCamera={(cameraId) => {
            onSelectCamera(cameraId)
            setIsCameraPickerOpen(false)
          }}
          selectedCameraId={selectedCamera?.id ?? selectedCameraId}
        />
      ) : null}
      <div className={`c2-slew-state c2-slew-${slewToCueState.status}`}>
        <strong>{selectedCamera?.name ?? selectedCameraId} / Slew-to-Cue: {slewToCueState.status.toUpperCase()}</strong>
        <span>{slewToCueState.reason}</span>
      </div>
      {commandMetadata ? <div className="c2-command-note">{commandMetadata.command_type} / dry-run / {commandMetadata.command_id}</div> : null}
      {isEvidenceOpen ? <CameraEvidencePanel archivedEvidences={archivedEvidences} evidences={evidences} onClose={() => setIsEvidenceOpen(false)} /> : null}
    </section>
  )
}

function CameraPickerPanel({
  cameraDevices,
  onClose,
  onSelectCamera,
  selectedCameraId,
}: {
  cameraDevices: DeviceListRow[]
  onClose: () => void
  onSelectCamera: (cameraId: string) => void
  selectedCameraId: string
}) {
  return (
    <div className="c2-camera-picker-panel">
      <div className="c2-camera-picker-heading">
        <div>
          <strong>Var Olan Kameralar</strong>
          <span>Gormek istedigin feed'i sec</span>
        </div>
        <button aria-label="Kamera listesini kapat" onClick={onClose} type="button">
          Kapat
        </button>
      </div>
      <div className="c2-camera-picker-list c2-scroll">
        {cameraDevices.map((camera) => (
          <button
            className={camera.id === selectedCameraId ? 'is-selected' : ''}
            key={camera.id}
            onClick={() => onSelectCamera(camera.id)}
            type="button"
          >
            <strong>{camera.name}</strong>
            <span>{camera.id} / {camera.model_no}</span>
            <span>{camera.protocol} / {camera.status.toUpperCase()}</span>
          </button>
        ))}
        {cameraDevices.length === 0 ? <div className="c2-evidence-empty">Kayitli kamera yok.</div> : null}
      </div>
    </div>
  )
}

function CameraEvidenceRail({ evidences, onOpen }: { evidences: CameraEvidenceEvent[]; onOpen: () => void }) {
  return (
    <aside className="c2-evidence-rail" aria-label="Kamera snapshot gecmisi">
      <div className="c2-evidence-rail-head">
        <strong>Evidence / Snapshots</strong>
        <button onClick={onOpen} type="button">
          Ac
        </button>
      </div>
      <div className="c2-evidence-rail-list c2-scroll">
        {evidences.slice(0, 3).map((item) => (
          <article className="c2-evidence-mini" key={`${item.device_id}-${item.start_time}`}>
            <div className="c2-evidence-preview" aria-hidden="true">
              {item.imaging_mode === 'THERMAL_IR' ? 'IR' : 'EO'}
            </div>
            <div>
              <strong>{item.threat_classification}</strong>
              <span>{formatClock(new Date(item.start_time))} / {Math.round(item.confidence_score * 100)}%</span>
              {item.detected_plate ? <span>{item.detected_plate}</span> : <span>{item.device_id}</span>}
            </div>
          </article>
        ))}
        {evidences.length === 0 ? <div className="c2-evidence-empty">Kayit yok.</div> : null}
      </div>
    </aside>
  )
}

function CameraEvidencePanel({
  archivedEvidences,
  evidences,
  onClose,
}: {
  archivedEvidences: CameraEvidenceEvent[]
  evidences: CameraEvidenceEvent[]
  onClose: () => void
}) {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const visibleEvidences = isHistoryOpen ? archivedEvidences : evidences

  return (
    <div className="c2-evidence-panel">
      <div className="c2-evidence-heading">
        <div>
          <strong>{isHistoryOpen ? 'Gecmis Kamera Verileri' : 'Camera Evidence'}</strong>
          <span>{isHistoryOpen ? '24 saati gecen snapshot ve uyari kayitlari' : 'Son 24 saat snapshot referanslari'}</span>
        </div>
        <div className="c2-panel-actions">
          <button onClick={() => setIsHistoryOpen((current) => !current)} type="button">
            {isHistoryOpen ? 'Son 24s' : `Gecmis ${archivedEvidences.length}`}
          </button>
          <button aria-label="Snapshot panelini kucult" onClick={onClose} type="button">
            Geri
          </button>
        </div>
      </div>
      <div className="c2-evidence-list c2-scroll">
        {visibleEvidences.length === 0 ? (
          <div className="c2-evidence-empty">{isHistoryOpen ? 'Gecmis kamera verisi yok.' : 'Son 24 saatte kamera kaniti yok.'}</div>
        ) : (
          visibleEvidences.map((item) => (
            <article className="c2-evidence-row" key={`${item.device_id}-${item.start_time}`}>
              <div className="c2-evidence-preview" aria-hidden="true">
                {item.imaging_mode === 'THERMAL_IR' ? 'IR' : 'EO'}
              </div>
              <div>
                <strong>{item.threat_classification}</strong>
                <span>{item.device_id} / {item.model_no}</span>
                <span>CONF {Math.round(item.confidence_score * 100)}% / FOV {item.fov_horizontal_deg} deg</span>
                {item.detected_plate ? <span>PLATE {item.detected_plate}</span> : null}
                <code>{item.evidence_snapshot_mock_url}</code>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  )
}

function AlarmFeedCard({ alarms }: { alarms: AlarmLog[] }) {
  return (
    <section className="c2-card c2-alarm-feed-card">
      <PanelTitle
        info="Radar, RF, kamera veya C2 kaynaklarindan gelen son uyarilari kronolojik canli akis olarak gosterir."
        subtitle="4 log gorunur, sonrasi ic scroll"
        title="AlarmFeedCard"
      />
      <div className="c2-alarm-list c2-scroll">
        {alarms.map((alarm) => (
          <article className={`c2-feed-row c2-severity-border-${alarm.severity}`} key={alarm.id}>
            <strong>{alarm.title}</strong>
            <span>{alarm.source} / {formatClock(new Date(alarm.timestamp))}</span>
          </article>
        ))}
      </div>
    </section>
  )
}

function AlertList({ alarms }: { alarms: AlarmLog[] }) {
  return (
    <div className="c2-alert-list c2-scroll">
      {alarms.map((alarm) => (
        <article className={`c2-feed-row c2-severity-border-${alarm.severity}`} key={alarm.id}>
          <strong>{alarm.id} / {alarm.title}</strong>
          <span>{alarm.source} / {alarm.severity}</span>
        </article>
      ))}
    </div>
  )
}

function IncidentList({ incidents }: { incidents: IncidentFolder[] }) {
  return (
    <div className="c2-incident-list c2-scroll">
      {incidents.map((incident) => (
        <article className={`c2-incident-folder c2-severity-border-${incident.severity}`} key={incident.id}>
          <div>
            <strong>{incident.id}</strong>
            <span>{incident.status} / confidence {incident.confidence}%</span>
          </div>
          <p>{incident.title}</p>
          <textarea aria-label={`${incident.id} operator notu`} defaultValue={incident.operator_note} />
        </article>
      ))}
    </div>
  )
}

function RadarPpiPanel({
  archivedRadarTracks,
  radarTracks,
}: {
  archivedRadarTracks: RadarTrackEvent[]
  radarTracks: RadarTrackEvent[]
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')

    if (!canvas || !context) {
      return
    }

    const canvasElement = canvas
    const canvasContext = context
    let frameId = 0
    let sweep = 0

    function draw() {
      const rect = canvasElement.getBoundingClientRect()
      const ratio = window.devicePixelRatio || 1
      canvasElement.width = Math.max(1, Math.floor(rect.width * ratio))
      canvasElement.height = Math.max(1, Math.floor(rect.height * ratio))
      canvasContext.setTransform(ratio, 0, 0, ratio, 0, 0)

      const width = rect.width
      const height = rect.height
      const cx = width / 2
      const cy = height / 2
      const radius = Math.min(width, height) * 0.4

      canvasContext.fillStyle = '#030811'
      canvasContext.fillRect(0, 0, width, height)
      canvasContext.strokeStyle = 'rgba(20, 255, 137, 0.22)'
      canvasContext.lineWidth = 1
      for (const scale of [0.25, 0.5, 0.75, 1]) {
        canvasContext.beginPath()
        canvasContext.arc(cx, cy, radius * scale, 0, Math.PI * 2)
        canvasContext.stroke()
      }
      for (let deg = 0; deg < 360; deg += 45) {
        const rad = toRadians(deg)
        canvasContext.beginPath()
        canvasContext.moveTo(cx, cy)
        canvasContext.lineTo(cx + Math.sin(rad) * radius, cy - Math.cos(rad) * radius)
        canvasContext.stroke()
      }
      for (const track of radarTracks.slice(0, 8)) {
        const rad = toRadians(track.heading_degrees)
        const distance = Math.min(1, Math.max(0.12, track.velocity_mps / 36))
        canvasContext.fillStyle = severityFromRadarTrack(track) === 'critical' ? '#ff4d5d' : '#14ff89'
        canvasContext.beginPath()
        canvasContext.arc(cx + Math.sin(rad) * radius * distance, cy - Math.cos(rad) * radius * distance, 4, 0, Math.PI * 2)
        canvasContext.fill()
      }
      const sweepRad = toRadians(sweep)
      canvasContext.strokeStyle = '#14ff89'
      canvasContext.lineWidth = 2
      canvasContext.beginPath()
      canvasContext.moveTo(cx, cy)
      canvasContext.lineTo(cx + Math.sin(sweepRad) * radius, cy - Math.cos(sweepRad) * radius)
      canvasContext.stroke()
      sweep = (sweep + 2.8) % 360
      frameId = window.requestAnimationFrame(draw)
    }

    frameId = window.requestAnimationFrame(draw)

    return () => window.cancelAnimationFrame(frameId)
  }, [radarTracks])

  return (
    <section className="c2-card c2-ppi-card">
      <PanelTitle
        action={
          <button className="c2-history-button" onClick={() => setIsHistoryOpen(true)} type="button">
            Gecmis Veriler {archivedRadarTracks.length}
          </button>
        }
        info="Radar izlerini askeri PPI benzeri dairesel tarama ekraninda gosterir; canvas uzerinde sweep ve hedef noktalarini cizer."
        subtitle={`Son 24 saat ASTERIX tracks: ${radarTracks.length}`}
        title="RadarPpiPanel"
      />
      <canvas ref={canvasRef} />
      {isHistoryOpen ? <RadarHistoryPanel onClose={() => setIsHistoryOpen(false)} radarTracks={archivedRadarTracks} /> : null}
    </section>
  )
}

function RadarHistoryPanel({ onClose, radarTracks }: { onClose: () => void; radarTracks: RadarTrackEvent[] }) {
  return (
    <div className="c2-history-panel">
      <div className="c2-history-heading">
        <div>
          <strong>Gecmis Radar Verileri</strong>
          <span>24 saati gecen ASTERIX track kayitlari</span>
        </div>
        <button onClick={onClose} type="button">
          Geri
        </button>
      </div>
      <div className="c2-history-list c2-scroll">
        {radarTracks.length === 0 ? (
          <div className="c2-evidence-empty">Gecmis radar verisi yok.</div>
        ) : (
          radarTracks.map((track) => (
            <article className="c2-history-row" key={`${track.target_id}-${track.timestamp}`}>
              <strong>{track.target_id} / {track.device_id}</strong>
              <span>{formatDateTime(track.timestamp)} / {track.protocol}</span>
              <span>HDG {track.heading_degrees}deg / VEL {track.velocity_mps}m/s / ALT {track.altitude_meters}m</span>
              <code>RCS {track.rcs_dbsm} dBsm / {track.model_no}</code>
            </article>
          ))
        )}
      </div>
    </div>
  )
}

function SensorEventTester({ onCreateEvent }: { onCreateEvent: (kind: IngestKind) => void }) {
  const buttons: Array<{ kind: IngestKind; label: string }> = [
    { kind: 'thermal', label: 'Termal Test' },
    { kind: 'radar', label: 'Radar Test' },
    { kind: 'rf', label: 'RF Test' },
    { kind: 'c2', label: 'C2 Test' },
  ]

  return (
    <div className="c2-card c2-tester">
      {buttons.map((button) => (
        <button key={button.kind} onClick={() => onCreateEvent(button.kind)} type="button">
          {button.label}
        </button>
      ))}
    </div>
  )
}

function SensorEventList({ normalizedEvents }: { normalizedEvents: NormalizedSensorEvent[] }) {
  return (
    <section className="c2-card c2-event-card">
      <PanelTitle
        info="Mock ingest butonlari veya gelecekteki WebSocket adapterlerinden gelen normalize sensor olaylarini tek tabloda toplar."
        subtitle="4 satir gorunur, sonrasi ic scroll"
        title="SensorEventList"
      />
      <div className="c2-event-scroll c2-scroll">
        <table>
          <thead>
            <tr>
              <th>Tip</th>
              <th>Cihaz</th>
              <th>Zaman</th>
              <th>Payload</th>
            </tr>
          </thead>
          <tbody>
            {normalizedEvents.map((event) => (
              <tr key={event.id}>
                <td>{event.source_type}</td>
                <td>{event.device_id}</td>
                <td>{formatClock(new Date(event.timestamp))}</td>
                <td>{event.payload_summary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function RfTimeline({
  archivedSigintEvents,
  sigintEvents,
}: {
  archivedSigintEvents: SIGINTDetectionEvent[]
  sigintEvents: SIGINTDetectionEvent[]
}) {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)

  return (
    <section className="c2-card c2-rf-card">
      <PanelTitle
        action={
          <button className="c2-history-button" onClick={() => setIsHistoryOpen(true)} type="button">
            Gecmis Veriler {archivedSigintEvents.length}
          </button>
        }
        info="SIGINT/RF olaylarini spektrum waterfall benzeri zaman-frekans gorunumunde ozetler."
        subtitle="Son 24 saat TCP_RAW_STREAM spectrum waterfall"
        title="RF / Timeline"
      />
      <div className="c2-waterfall">
        {Array.from({ length: 18 }, (_, index) => {
          const event = sigintEvents[index % Math.max(1, sigintEvents.length)]
          const left = event ? Math.max(4, Math.min(92, (event.center_frequency_mhz % 1000) / 10)) : 40
          const opacity = event ? Math.max(0.24, Math.min(0.92, (95 + event.signal_strength_dbm) / 44)) : 0.2

          return <span key={`${event?.device_id ?? 'empty'}-${event?.center_frequency_mhz ?? 'none'}-${index}`} style={{ left: `${left}%`, opacity }} />
        })}
      </div>
      {isHistoryOpen ? <RfHistoryPanel onClose={() => setIsHistoryOpen(false)} sigintEvents={archivedSigintEvents} /> : null}
    </section>
  )
}

function RfHistoryPanel({ onClose, sigintEvents }: { onClose: () => void; sigintEvents: SIGINTDetectionEvent[] }) {
  return (
    <div className="c2-history-panel">
      <div className="c2-history-heading">
        <div>
          <strong>Gecmis RF Verileri</strong>
          <span>24 saati gecen frekans ve DOA kayitlari</span>
        </div>
        <button onClick={onClose} type="button">
          Geri
        </button>
      </div>
      <div className="c2-history-list c2-scroll">
        {sigintEvents.length === 0 ? (
          <div className="c2-evidence-empty">Gecmis RF verisi yok.</div>
        ) : (
          sigintEvents.map((event) => (
            <article className="c2-history-row" key={`${event.device_id}-${event.center_frequency_mhz}-${event.timestamp ?? event.direction_of_arrival_deg}`}>
              <strong>{event.device_id} / {event.center_frequency_mhz}MHz</strong>
              <span>{formatDateTime(event.timestamp)} / {event.protocol}</span>
              <span>{event.modulation_type} / BW {event.bandwidth_mhz}MHz / RSSI {event.signal_strength_dbm}dBm</span>
              <code>DOA {event.direction_of_arrival_deg}deg / duration {event.duration_seconds}s / {event.model_no}</code>
            </article>
          ))
        )}
      </div>
    </div>
  )
}

function PanelTitle({ action, info, subtitle, title }: { action?: ReactNode; info?: string; subtitle: string; title: string }) {
  return (
    <div className="c2-panel-title">
      <div className="c2-title-row">
        <strong>{title}</strong>
        {info ? (
          <button aria-label={`${title} bilgi`} className="c2-info" data-info={info} type="button">
            i
          </button>
        ) : null}
        {action ? <div className="c2-title-action">{action}</div> : null}
      </div>
      <span>{subtitle}</span>
    </div>
  )
}

function StatusBadge({ status }: { status: DeviceStatus }) {
  return <span className={`c2-status c2-status-${status}`}>{status}</span>
}

function MapOverlay({ text, tone }: { text: string; tone: 'cyan' | 'red' }) {
  return (
    <div className={`c2-map-overlay c2-map-overlay-${tone}`}>
      <strong>{text}</strong>
    </div>
  )
}

function radarToMapPlot(track: RadarTrackEvent) {
  return {
    track,
  }
}

function getBearingEndpoint(origin: [number, number], bearingDegrees: number, distanceMeters: number): [number, number] {
  const earthRadiusMeters = 6378137
  const bearing = toRadians(bearingDegrees)
  const angularDistance = distanceMeters / earthRadiusMeters
  const lat1 = toRadians(origin[0])
  const lon1 = toRadians(origin[1])
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(angularDistance) +
      Math.cos(lat1) * Math.sin(angularDistance) * Math.cos(bearing),
  )
  const lon2 =
    lon1 +
    Math.atan2(
      Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(lat1),
      Math.cos(angularDistance) - Math.sin(lat1) * Math.sin(lat2),
    )

  return [(lat2 * 180) / Math.PI, (lon2 * 180) / Math.PI]
}

function formatClock(date: Date, timeZone?: string): string {
  return new Intl.DateTimeFormat('tr-TR', {
    hour: '2-digit',
    hour12: false,
    minute: '2-digit',
    second: '2-digit',
    timeZone,
  }).format(date)
}

function formatDateTime(value: string | undefined): string {
  if (!value) {
    return 'timestamp yok'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'timestamp gecersiz'
  }

  return `${date.toLocaleDateString('tr-TR')} ${formatClock(date)}`
}

function isWithinLast24Hours(value: string | undefined, now: Date): boolean {
  if (!value) {
    return false
  }

  const timestamp = new Date(value).getTime()

  if (Number.isNaN(timestamp)) {
    return false
  }

  const ageMs = now.getTime() - timestamp

  return ageMs >= 0 && ageMs <= 24 * 60 * 60 * 1000
}

function formatUptime(startedAt: string, now: Date): string {
  const minutes = Math.max(0, Math.floor((now.getTime() - new Date(startedAt).getTime()) / 60000))
  const hours = Math.floor(minutes / 60)

  return `${hours.toString().padStart(2, '0')}h ${(minutes % 60).toString().padStart(2, '0')}m`
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180
}
