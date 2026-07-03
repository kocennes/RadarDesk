import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { Circle, CircleMarker, MapContainer, Polyline, Popup, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import './NexusC2Dashboard.css'

export interface RadarTrackEvent {
  device_id: string
  model_no: string
  protocol: 'ASTERIX_CAT048'
  target_id: string
  timestamp: string
  latitude: number
  longitude: number
  altitude_meters: number
  velocity_mps: number
  heading_degrees: number
  rcs_dbsm: number
}

export interface SIGINTDetectionEvent {
  device_id: string
  model_no: string
  protocol: 'TCP_RAW_STREAM'
  center_frequency_mhz: number
  bandwidth_mhz: number
  signal_strength_dbm: number
  modulation_type: string
  duration_seconds: number
  direction_of_arrival_deg: number
}

export interface CameraEvidenceEvent {
  device_id: string
  model_no: string
  protocol: 'RTSP_H264'
  fov_horizontal_deg: number
  imaging_mode: 'DAYLIGHT' | 'THERMAL_IR'
  threat_classification: 'DRONE' | 'HUMAN_INTRUSION' | 'MILITARY_VEHICLE' | 'SUSPICIOUS_CIVILIAN'
  confidence_score: number
  detected_plate?: string
  evidence_snapshot_mock_url: string
  start_time: string
}

type DashboardState = 'success' | 'loading' | 'error' | 'empty'
type Severity = 'low' | 'medium' | 'high' | 'critical'
type IngestKind = 'thermal' | 'radar' | 'rf' | 'c2'
type TabKey = 'alerts' | 'incidents'
type DeviceStatus = 'online' | 'warning' | 'alarm' | 'offline'

interface DeviceListRow {
  id: string
  name: string
  model_no: string
  protocol: RadarTrackEvent['protocol'] | SIGINTDetectionEvent['protocol'] | CameraEvidenceEvent['protocol'] | 'HTTPS_SSE'
  active_frequency: string
  status: DeviceStatus
  started_at: string
}

interface NormalizedSensorEvent {
  id: string
  source_type: IngestKind
  device_id: string
  protocol: string
  timestamp: string
  payload_summary: string
  severity: Severity
}

interface AlarmLog {
  id: string
  title: string
  source: string
  timestamp: string
  severity: Severity
}

interface IncidentFolder {
  id: string
  title: string
  confidence: number
  severity: Severity
  status: 'open' | 'reviewing' | 'confirmed'
  operator_note: string
}

interface CameraCommandMetadata {
  command_id: string
  command_type: 'ptz_slew_to_track'
  dry_run: true
  requested_at: string
  target_id: string
  device_id: string
}

const siteOrigin = {
  latitude: 39.9334,
  longitude: 32.8597,
}

const initialRadarTracks: RadarTrackEvent[] = [
  createRadarTrackEvent({ heading_degrees: 42, latitudeOffset: 0.0032, longitudeOffset: 0.0048, rcs_dbsm: -13.4, target_id: 'TRK-9042', velocity_mps: 24 }),
  createRadarTrackEvent({ heading_degrees: 316, latitudeOffset: -0.0028, longitudeOffset: 0.0029, rcs_dbsm: -18.2, target_id: 'TRK-1447', velocity_mps: 12 }),
  createRadarTrackEvent({ heading_degrees: 81, latitudeOffset: 0.0012, longitudeOffset: -0.0041, rcs_dbsm: -9.8, target_id: 'TRK-3881', velocity_mps: 18 }),
]

const initialSigintEvents: SIGINTDetectionEvent[] = [
  createSigintEvent({ center_frequency_mhz: 2412, direction_of_arrival_deg: 58, duration_seconds: 18, modulation_type: 'OFDM', signal_strength_dbm: -61 }),
  createSigintEvent({ center_frequency_mhz: 5805, direction_of_arrival_deg: 284, duration_seconds: 9, modulation_type: 'FHSS', signal_strength_dbm: -68 }),
  createSigintEvent({ center_frequency_mhz: 915, direction_of_arrival_deg: 132, duration_seconds: 6, modulation_type: 'FSK', signal_strength_dbm: -76 }),
]

const initialCameraEvidences: CameraEvidenceEvent[] = [
  createCameraEvidenceEvent({
    confidence_score: 0.86,
    evidence_snapshot_mock_url: '/mock/evidence/thermal-drone-001.jpg',
    fov_horizontal_deg: 42,
    imaging_mode: 'THERMAL_IR',
    threat_classification: 'DRONE',
  }),
  createCameraEvidenceEvent({
    confidence_score: 0.72,
    detected_plate: '06 BIS 042',
    evidence_snapshot_mock_url: '/mock/evidence/anpr-vehicle-017.jpg',
    fov_horizontal_deg: 54,
    imaging_mode: 'DAYLIGHT',
    threat_classification: 'SUSPICIOUS_CIVILIAN',
  }),
]

const initialDevices: DeviceListRow[] = [
  deviceRow('BIS-RAD-01', 'Kuzey Radar', 'BIS-RAD-200X', 'ASTERIX_CAT048', 'N/A', 'online', 236),
  deviceRow('BIS-RF-04', 'Dogu SIGINT Node', 'BIS-SIGINT-V3', 'TCP_RAW_STREAM', '2412 MHz', 'warning', 128),
  deviceRow('BIS-CAM-02', 'Termal PTZ', 'BIS-THERMAL-PTZ', 'RTSP_H264', 'N/A', 'online', 92),
  deviceRow('BIS-LPR-02', 'Plaka Okuma', 'BIS-ANPR-CIV', 'RTSP_H264', 'N/A', 'online', 421),
  deviceRow('BIS-C2-01', 'NEXUS Gateway', 'NEXUS-C2-GW', 'HTTPS_SSE', 'N/A', 'online', 517),
  deviceRow('BIS-RF-09', 'Mobil RF Node', 'BIS-SIGINT-L', 'TCP_RAW_STREAM', '5805 MHz', 'offline', 31),
]

const initialIncidents: IncidentFolder[] = [
  incident('INC-2407-A', 'Radar + RF ile coklu sensor IHA adayi', 88, 'critical', 'reviewing', 'ASTERIX track ve RF DOA ayni sektor penceresinde.'),
  incident('INC-2407-B', 'EO/IR termal dogrulama bekliyor', 71, 'high', 'open', 'Kamera hedef bolgeye yonlendirildi, gorus kosulu izleniyor.'),
  incident('INC-2407-C', 'Sivil plaka okuma uyarisi', 54, 'low', 'open', 'ANPR alarmi sivil guvenlik prosedurune aktarilacak.'),
  incident('INC-2407-D', 'Tek sensor RF anomalisi', 62, 'medium', 'open', 'Kisa sureli FHSS aktivitesi, tekrar gozlem gerekiyor.'),
]

export default function NexusC2Dashboard() {
  const [dashboardState, setDashboardState] = useState<DashboardState>('success')
  const [activeTab, setActiveTab] = useState<TabKey>('alerts')
  const [now, setNow] = useState<Date>(() => new Date())
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [radarTracks, setRadarTracks] = useState<RadarTrackEvent[]>(initialRadarTracks)
  const [sigintEvents, setSigintEvents] = useState<SIGINTDetectionEvent[]>(initialSigintEvents)
  const [cameraEvidences, setCameraEvidences] = useState<CameraEvidenceEvent[]>(initialCameraEvidences)
  const [normalizedEvents, setNormalizedEvents] = useState<NormalizedSensorEvent[]>(() =>
    normalizeInitialEvents(initialRadarTracks, initialSigintEvents, initialCameraEvidences),
  )
  const [alarms, setAlarms] = useState<AlarmLog[]>(() => createAlarmLogs(initialRadarTracks, initialSigintEvents, initialCameraEvidences))
  const [cameraCommand, setCameraCommand] = useState<CameraCommandMetadata>()

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(new Date()), 1000)

    return () => window.clearInterval(intervalId)
  }, [])

  const visibleDevices = dashboardState === 'empty' ? [] : initialDevices
  const latestCameraEvidence = cameraEvidences[0]
  const stats = useMemo(
    () => ({
      activeAlarms: alarms.filter((alarmItem) => alarmItem.severity !== 'low').length,
      criticalThreats: alarms.filter((alarmItem) => alarmItem.severity === 'critical').length,
      onlineDevices: visibleDevices.filter((deviceItem) => deviceItem.status === 'online' || deviceItem.status === 'warning').length,
      totalDevices: visibleDevices.length,
    }),
    [alarms, visibleDevices],
  )

  function dispatchMockIngest(kind: IngestKind) {
    if (kind === 'radar') {
      const packet = createRadarTrackEvent()
      setRadarTracks((current) => [packet, ...current].slice(0, 18))
      pushNormalizedEvent(normalizeRadarTrack(packet))
      pushAlarm(alarmFromRadarTrack(packet))
      return
    }

    if (kind === 'rf') {
      const packet = createSigintEvent()
      setSigintEvents((current) => [packet, ...current].slice(0, 18))
      pushNormalizedEvent(normalizeSigint(packet))
      pushAlarm(alarmFromSigint(packet))
      return
    }

    if (kind === 'thermal') {
      const packet = createCameraEvidenceEvent()
      setCameraEvidences((current) => [packet, ...current].slice(0, 12))
      pushNormalizedEvent(normalizeCameraEvidence(packet))
      pushAlarm(alarmFromCameraEvidence(packet))
      return
    }

    pushNormalizedEvent({
      device_id: 'BIS-C2-01',
      id: `EVT-C2-${Date.now().toString().slice(-6)}`,
      payload_summary: 'C2 heartbeat: gateway nominal / local ingestion bus active',
      protocol: 'HTTPS_SSE',
      severity: 'low',
      source_type: 'c2',
      timestamp: new Date().toISOString(),
    })
  }

  function pushNormalizedEvent(event: NormalizedSensorEvent) {
    setNormalizedEvents((current) => [event, ...current].slice(0, 32))
  }

  function pushAlarm(alarm: AlarmLog) {
    setAlarms((current) => [alarm, ...current].slice(0, 28))
  }

  function handleCameraSuggest() {
    setCameraCommand({
      command_id: `CMD-${Date.now().toString().slice(-6)}`,
      command_type: 'ptz_slew_to_track',
      device_id: latestCameraEvidence?.device_id ?? 'BIS-CAM-02',
      dry_run: true,
      requested_at: new Date().toISOString(),
      target_id: radarTracks[0]?.target_id ?? 'TRK-LOCAL',
    })
  }

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
          <OperationsMap dashboardState={dashboardState} radarTracks={dashboardState === 'empty' ? [] : radarTracks} sigintEvents={sigintEvents} />
        </section>

        <CameraFeedCard commandMetadata={cameraCommand} evidence={latestCameraEvidence} onSuggestCamera={handleCameraSuggest} />
      </section>

      <section className="c2-alerts-grid" aria-label="Alarm ve olay akisi">
        <AlarmFeedCard alarms={alarms} />
        <section className="c2-card c2-tabs-card">
          <div className="c2-tabs" role="tablist" aria-label="Alarm ve olay dosyalari">
            <button className={activeTab === 'alerts' ? 'is-active' : ''} onClick={() => setActiveTab('alerts')} type="button">
              Alerts
            </button>
            <button className={activeTab === 'incidents' ? 'is-active' : ''} onClick={() => setActiveTab('incidents')} type="button">
              Incidents
            </button>
          </div>
          {activeTab === 'alerts' ? <AlertList alarms={alarms} /> : <IncidentList incidents={initialIncidents} />}
        </section>
      </section>

      <section className="c2-secondary-grid" aria-label="Teknik lab ve sinyal analizi">
        <RadarPpiPanel radarTracks={radarTracks} />
        <section className="c2-lab-column">
          <SensorEventTester onCreateEvent={dispatchMockIngest} />
          <SensorEventList normalizedEvents={normalizedEvents} />
        </section>
        <RfTimeline sigintEvents={sigintEvents} />
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
  radarTracks,
  sigintEvents,
}: {
  dashboardState: DashboardState
  radarTracks: RadarTrackEvent[]
  sigintEvents: SIGINTDetectionEvent[]
}) {
  const plots = radarTracks.map((track) => radarToMapPlot(track))
  const center: [number, number] = [siteOrigin.latitude, siteOrigin.longitude]

  return (
    <div className="c2-map-surface">
      <MapContainer center={center} className="c2-leaflet-map" scrollWheelZoom zoom={16} zoomControl>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Circle center={center} color="#00e5ff" fillColor="#00e5ff" fillOpacity={0.035} opacity={0.38} radius={900} weight={2} />
        <Circle center={center} color="#00e5ff" fillColor="#00e5ff" fillOpacity={0.025} opacity={0.26} radius={1500} weight={1} />
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
  commandMetadata,
  evidence,
  onSuggestCamera,
}: {
  commandMetadata: CameraCommandMetadata | undefined
  evidence: CameraEvidenceEvent | undefined
  onSuggestCamera: () => void
}) {
  return (
    <section className="c2-card c2-camera-card">
      <PanelTitle
        info="EO/IR veya gunduz kamera goruntusunun durumunu, FOV bilgisini, algilanan sinifi ve guven skorunu gosterir. Kamera Oner butonu sadece backend icin dry-run komut metadatasi uretir."
        subtitle="RTSP_H264 evidence metadata"
        title="CameraFeedCard"
      />
      <div className="c2-camera-frame">
        <div className="c2-camera-reticle" />
        <span className="c2-camera-fov">FOV {evidence?.fov_horizontal_deg ?? 42} deg / {evidence?.imaging_mode ?? 'THERMAL_IR'}</span>
        <span className="c2-camera-mode">CONF {Math.round((evidence?.confidence_score ?? 0) * 100)}%</span>
        <span className="c2-camera-class">{evidence?.threat_classification ?? 'NO_TARGET'}</span>
      </div>
      <button className="c2-primary-button" onClick={onSuggestCamera} type="button">
        Kamera Oner
      </button>
      {commandMetadata ? <div className="c2-command-note">{commandMetadata.command_type} / dry-run / {commandMetadata.command_id}</div> : null}
    </section>
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

function RadarPpiPanel({ radarTracks }: { radarTracks: RadarTrackEvent[] }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

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
        info="Radar izlerini askeri PPI benzeri dairesel tarama ekraninda gosterir; canvas uzerinde sweep ve hedef noktalarini cizer."
        subtitle={`ASTERIX tracks: ${radarTracks.length}`}
        title="RadarPpiPanel"
      />
      <canvas ref={canvasRef} />
    </section>
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

function RfTimeline({ sigintEvents }: { sigintEvents: SIGINTDetectionEvent[] }) {
  return (
    <section className="c2-card c2-rf-card">
      <PanelTitle
        info="SIGINT/RF olaylarini spektrum waterfall benzeri zaman-frekans gorunumunde ozetler."
        subtitle="TCP_RAW_STREAM spectrum waterfall"
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
    </section>
  )
}

function PanelTitle({ info, subtitle, title }: { info?: string; subtitle: string; title: string }) {
  return (
    <div className="c2-panel-title">
      <div className="c2-title-row">
        <strong>{title}</strong>
        {info ? (
          <button aria-label={`${title} bilgi`} className="c2-info" data-info={info} type="button">
            i
          </button>
        ) : null}
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

function normalizeInitialEvents(
  radarTracks: RadarTrackEvent[],
  sigintEvents: SIGINTDetectionEvent[],
  cameraEvidences: CameraEvidenceEvent[],
): NormalizedSensorEvent[] {
  return [
    ...radarTracks.map(normalizeRadarTrack),
    ...sigintEvents.map(normalizeSigint),
    ...cameraEvidences.map(normalizeCameraEvidence),
  ].sort((left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime())
}

function normalizeRadarTrack(event: RadarTrackEvent): NormalizedSensorEvent {
  return {
    device_id: event.device_id,
    id: `EVT-${event.target_id}`,
    payload_summary: `ASTERIX target=${event.target_id} vel=${event.velocity_mps}m/s hdg=${event.heading_degrees} rcs=${event.rcs_dbsm}dBsm`,
    protocol: event.protocol,
    severity: severityFromRadarTrack(event),
    source_type: 'radar',
    timestamp: event.timestamp,
  }
}

function normalizeSigint(event: SIGINTDetectionEvent): NormalizedSensorEvent {
  const timestamp = new Date().toISOString()

  return {
    device_id: event.device_id,
    id: `EVT-SIG-${timestamp}`,
    payload_summary: `${event.modulation_type} ${event.center_frequency_mhz}MHz bw=${event.bandwidth_mhz}MHz rssi=${event.signal_strength_dbm}dBm doa=${event.direction_of_arrival_deg}deg`,
    protocol: event.protocol,
    severity: severityFromSigint(event),
    source_type: 'rf',
    timestamp,
  }
}

function normalizeCameraEvidence(event: CameraEvidenceEvent): NormalizedSensorEvent {
  return {
    device_id: event.device_id,
    id: `EVT-CAM-${event.start_time}`,
    payload_summary: `${event.imaging_mode} ${event.threat_classification} conf=${event.confidence_score.toFixed(2)}${event.detected_plate ? ` plate=${event.detected_plate}` : ''}`,
    protocol: event.protocol,
    severity: severityFromCamera(event),
    source_type: 'thermal',
    timestamp: event.start_time,
  }
}

function createAlarmLogs(
  radarTracks: RadarTrackEvent[],
  sigintEvents: SIGINTDetectionEvent[],
  cameraEvidences: CameraEvidenceEvent[],
): AlarmLog[] {
  return [
    ...radarTracks.map(alarmFromRadarTrack),
    ...sigintEvents.map(alarmFromSigint),
    ...cameraEvidences.map(alarmFromCameraEvidence),
  ].sort((left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime())
}

function alarmFromRadarTrack(event: RadarTrackEvent): AlarmLog {
  return {
    id: `ALR-${event.target_id}`,
    severity: severityFromRadarTrack(event),
    source: `${event.device_id} / ${event.protocol}`,
    timestamp: event.timestamp,
    title: `Radar track ${event.target_id}`,
  }
}

function alarmFromSigint(event: SIGINTDetectionEvent): AlarmLog {
  return {
    id: `ALR-SIG-${Date.now().toString().slice(-6)}`,
    severity: severityFromSigint(event),
    source: `${event.device_id} / ${event.center_frequency_mhz.toFixed(1)}MHz`,
    timestamp: new Date().toISOString(),
    title: `${event.modulation_type} RF detection`,
  }
}

function alarmFromCameraEvidence(event: CameraEvidenceEvent): AlarmLog {
  return {
    id: `ALR-CAM-${Date.now().toString().slice(-6)}`,
    severity: severityFromCamera(event),
    source: `${event.device_id} / ${event.imaging_mode}`,
    timestamp: event.start_time,
    title: `${event.threat_classification} camera evidence`,
  }
}

function createRadarTrackEvent(overrides: Partial<RadarTrackEvent> & { latitudeOffset?: number; longitudeOffset?: number } = {}): RadarTrackEvent {
  const latitudeOffset = overrides.latitudeOffset ?? (randomInt(80) - 40) / 10000
  const longitudeOffset = overrides.longitudeOffset ?? (randomInt(80) - 40) / 10000

  return {
    altitude_meters: overrides.altitude_meters ?? 80 + randomInt(180),
    device_id: overrides.device_id ?? 'BIS-RAD-01',
    heading_degrees: overrides.heading_degrees ?? randomInt(360),
    latitude: overrides.latitude ?? siteOrigin.latitude + latitudeOffset,
    longitude: overrides.longitude ?? siteOrigin.longitude + longitudeOffset,
    model_no: overrides.model_no ?? 'BIS-RAD-200X',
    protocol: 'ASTERIX_CAT048',
    rcs_dbsm: overrides.rcs_dbsm ?? -22 + randomInt(17),
    target_id: overrides.target_id ?? `TRK-${1000 + randomInt(8999)}`,
    timestamp: overrides.timestamp ?? new Date().toISOString(),
    velocity_mps: overrides.velocity_mps ?? 8 + randomInt(26),
  }
}

function createSigintEvent(overrides: Partial<SIGINTDetectionEvent> = {}): SIGINTDetectionEvent {
  return {
    bandwidth_mhz: overrides.bandwidth_mhz ?? 20,
    center_frequency_mhz: overrides.center_frequency_mhz ?? (randomInt(2) === 0 ? 2412 + randomInt(72) : 5725 + randomInt(160)),
    device_id: overrides.device_id ?? 'BIS-RF-04',
    direction_of_arrival_deg: overrides.direction_of_arrival_deg ?? randomInt(360),
    duration_seconds: overrides.duration_seconds ?? 4 + randomInt(24),
    model_no: overrides.model_no ?? 'BIS-SIGINT-V3',
    modulation_type: overrides.modulation_type ?? (randomInt(2) === 0 ? 'OFDM' : 'FHSS'),
    protocol: 'TCP_RAW_STREAM',
    signal_strength_dbm: overrides.signal_strength_dbm ?? -52 - randomInt(32),
  }
}

function createCameraEvidenceEvent(overrides: Partial<CameraEvidenceEvent> = {}): CameraEvidenceEvent {
  const isCivil = overrides.threat_classification === 'SUSPICIOUS_CIVILIAN'

  return {
    confidence_score: overrides.confidence_score ?? Number((0.68 + Math.random() * 0.27).toFixed(2)),
    detected_plate: overrides.detected_plate ?? (isCivil ? `06 BIS ${100 + randomInt(899)}` : undefined),
    device_id: overrides.device_id ?? 'BIS-CAM-02',
    evidence_snapshot_mock_url: overrides.evidence_snapshot_mock_url ?? `/mock/evidence/capture-${Date.now()}.jpg`,
    fov_horizontal_deg: overrides.fov_horizontal_deg ?? (overrides.imaging_mode === 'DAYLIGHT' ? 54 : 42),
    imaging_mode: overrides.imaging_mode ?? (randomInt(2) === 0 ? 'THERMAL_IR' : 'DAYLIGHT'),
    model_no: overrides.model_no ?? 'BIS-THERMAL-PTZ',
    protocol: 'RTSP_H264',
    start_time: overrides.start_time ?? new Date().toISOString(),
    threat_classification: overrides.threat_classification ?? (randomInt(2) === 0 ? 'DRONE' : 'HUMAN_INTRUSION'),
  }
}

function deviceRow(
  id: string,
  name: string,
  model_no: string,
  protocol: DeviceListRow['protocol'],
  active_frequency: string,
  status: DeviceStatus,
  ageMinutes: number,
): DeviceListRow {
  return {
    active_frequency,
    id,
    model_no,
    name,
    protocol,
    started_at: minutesAgo(ageMinutes),
    status,
  }
}

function incident(
  id: string,
  title: string,
  confidence: number,
  severity: Severity,
  status: IncidentFolder['status'],
  operator_note: string,
): IncidentFolder {
  return { confidence, id, operator_note, severity, status, title }
}

function radarToMapPlot(track: RadarTrackEvent) {
  const x = clamp(50 + (track.longitude - siteOrigin.longitude) * 6000, 8, 92)
  const y = clamp(50 - (track.latitude - siteOrigin.latitude) * 6000, 8, 92)
  const rad = toRadians(track.heading_degrees)

  return {
    track,
    x,
    x2: x + Math.sin(rad) * 7,
    y,
    y2: y - Math.cos(rad) * 7,
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

function severityFromRadarTrack(event: RadarTrackEvent): Severity {
  if (event.velocity_mps >= 20 || event.rcs_dbsm > -12) {
    return 'critical'
  }

  if (event.velocity_mps >= 14) {
    return 'high'
  }

  return 'medium'
}

function severityFromSigint(event: SIGINTDetectionEvent): Severity {
  if (event.signal_strength_dbm >= -58 || event.duration_seconds >= 18) {
    return 'high'
  }

  if (event.signal_strength_dbm >= -72) {
    return 'medium'
  }

  return 'low'
}

function severityFromCamera(event: CameraEvidenceEvent): Severity {
  if (event.threat_classification === 'DRONE' && event.confidence_score >= 0.82) {
    return 'critical'
  }

  if (event.confidence_score >= 0.72) {
    return 'high'
  }

  return 'medium'
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

function formatUptime(startedAt: string, now: Date): string {
  const minutes = Math.max(0, Math.floor((now.getTime() - new Date(startedAt).getTime()) / 60000))
  const hours = Math.floor(minutes / 60)

  return `${hours.toString().padStart(2, '0')}h ${(minutes % 60).toString().padStart(2, '0')}m`
}

function minutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60000).toISOString()
}

function randomInt(max: number): number {
  return Math.floor(Math.random() * max)
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}
