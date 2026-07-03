import { useEffect, useState } from 'react'
import { Button, Card, CardHeader, FluentProvider, Text, webDarkTheme, webLightTheme } from '@fluentui/react-components'
import { Topbar } from '../components/layout/Topbar'
import { ListState } from '../components/ui/ListState'
import { AlarmFeedCard } from '../features/alerts/AlarmFeedCard'
import { AlertList } from '../features/alerts/AlertList'
import { filterAlerts, type AlertSeverityFilter } from '../features/alerts/alertFilters'
import { CameraFeedCard } from '../features/cameras/CameraFeedCard'
import { createCameraFeedForRegisteredDevice } from '../features/cameras/cameraFeedRegistration'
import { getDashboardStats } from '../features/dashboard/dashboardMetrics'
import { getDashboardViewData, type DashboardViewMode } from '../features/dashboard/dashboardViewState'
import { MetricCard } from '../features/dashboard/MetricCard'
import { getDashboardModuleVisibility } from '../features/dashboard/moduleVisibility'
import { StateToolbar } from '../features/dashboard/StateToolbar'
import { DeviceDiscoveryCard } from '../features/devices/DeviceDiscoveryCard'
import { DeviceList } from '../features/devices/DeviceList'
import { filterDevices, type DeviceStatusFilter } from '../features/devices/deviceFilters'
import { SensorEventList } from '../features/events/SensorEventList'
import { SensorEventTester } from '../features/events/SensorEventTester'
import { buildIncidentsFromSensorEvents } from '../features/incidents/incidentCorrelation'
import { IncidentList } from '../features/incidents/IncidentList'
import { MapPanelContent } from '../features/map/MapPanelContent'
import { ProjectIntakeCard } from '../features/projects/ProjectIntakeCard'
import { RadarPpiPanel } from '../features/radar/RadarPpiPanel'
import {
  deleteDevice,
  disconnectDevice,
  fetchDashboardData,
  ingestSensorEvent,
  registerDeviceFromDiscovery,
  requestCommand,
  updateIncidentReview,
} from '../services/apiClient'
import type { MockDashboardData } from '../services/mockApi'
import type { Device, Incident } from '../types/domain'
import './App.css'

const emptyDashboardData: MockDashboardData = {
  devices: [],
  alerts: [],
  projects: [],
  users: [],
  cameraFeeds: [],
  discoveredDevices: [],
  sensorEvents: [],
  incidents: [],
  effectiveAccess: {
    userId: '',
    role: 'none',
    customerIds: [],
    projectIds: [],
    packageIds: [],
    allowedDeviceTypes: [],
    allowedModules: [],
  },
}

type DashboardLoadState = 'loading' | 'success' | 'error'
type DashboardThemeMode = 'light' | 'tactical-dark'
type RightPanelTab = 'alerts' | 'incidents'

export function App() {
  const [dashboardData, setDashboardData] = useState<MockDashboardData>(emptyDashboardData)
  const [dashboardLoadState, setDashboardLoadState] = useState<DashboardLoadState>('loading')
  const [themeMode, setThemeMode] = useState<DashboardThemeMode>('tactical-dark')
  const [viewMode, setViewMode] = useState<DashboardViewMode>('success')
  const [deviceSearchTerm, setDeviceSearchTerm] = useState<string>('')
  const [deviceStatusFilter, setDeviceStatusFilter] = useState<DeviceStatusFilter>('all')
  const [alertSeverityFilter, setAlertSeverityFilter] = useState<AlertSeverityFilter>('all')
  const [actionDeviceId, setActionDeviceId] = useState<string>()
  const [rightPanelTab, setRightPanelTab] = useState<RightPanelTab>('alerts')

  useEffect(() => {
    let isCurrent = true

    async function loadDashboardData() {
      try {
        const nextDashboardData = await fetchDashboardData()

        if (isCurrent) {
          setDashboardData(nextDashboardData)
          setDashboardLoadState('success')
        }
      } catch {
        if (isCurrent) {
          setDashboardData(emptyDashboardData)
          setDashboardLoadState('error')
        }
      }
    }

    void loadDashboardData()

    return () => {
      isCurrent = false
    }
  }, [])

  const effectiveViewMode: DashboardViewMode =
    dashboardLoadState === 'success' ? viewMode : dashboardLoadState
  const visibleData = getDashboardViewData(effectiveViewMode, dashboardData.devices, dashboardData.alerts)
  const stats = getDashboardStats(visibleData.devices, visibleData.alerts)
  const currentProject = dashboardData.projects[0]
  const filteredAlerts = filterAlerts(visibleData.alerts, alertSeverityFilter)
  const filteredDevices = filterDevices(visibleData.devices, {
    searchTerm: deviceSearchTerm,
    status: deviceStatusFilter,
  })
  const moduleVisibility = getDashboardModuleVisibility(dashboardData.effectiveAccess)

  async function handleDisconnectDevice(device: Device) {
    if (!window.confirm(`${device.name} baglantisi kaldirilsin mi? Yeni event ve kanit uretimi duracak.`)) {
      return
    }

    setActionDeviceId(device.id)

    try {
      const disconnectedDevice = await disconnectDevice(device)

      setDashboardData((currentData) => ({
        ...currentData,
        cameraFeeds: currentData.cameraFeeds.map((cameraFeed) =>
          cameraFeed.deviceId === disconnectedDevice.id ? { ...cameraFeed, status: 'offline' } : cameraFeed,
        ),
        devices: currentData.devices.map((candidate) =>
          candidate.id === disconnectedDevice.id ? disconnectedDevice : candidate,
        ),
      }))
    } catch {
      window.alert('Cihaz baglantisi kaldirilamadi.')
    } finally {
      setActionDeviceId(undefined)
    }
  }

  async function handleDeleteDevice(device: Device) {
    if (!window.confirm(`${device.name} kayitli cihaz listesinden silinsin mi? Eski kanit ve olay gecmisi korunacak.`)) {
      return
    }

    setActionDeviceId(device.id)

    try {
      await deleteDevice(device.id)

      setDashboardData((currentData) => ({
        ...currentData,
        cameraFeeds: currentData.cameraFeeds.filter((cameraFeed) => cameraFeed.deviceId !== device.id),
        devices: currentData.devices.filter((candidate) => candidate.id !== device.id),
      }))
    } catch {
      window.alert('Cihaz silinemedi.')
    } finally {
      setActionDeviceId(undefined)
    }
  }

  async function handleRequestCameraCommand(incident: Incident) {
    const cameraDevice =
      dashboardData.devices.find(
        (device) => incident.sourceDeviceIds.includes(device.id) && device.type === 'eo-ir' && device.status !== 'offline',
      ) ??
      dashboardData.devices.find((device) => device.type === 'eo-ir' && device.status !== 'offline')

    if (!cameraDevice) {
      throw new Error('No camera device is available for command request.')
    }

    return requestCommand({
      commandType: 'ptz-slew',
      deviceId: cameraDevice.id,
      incidentId: incident.id,
      reason: `Incident ${incident.id} icin operator kamera yonlendirme onerisi.`,
    })
  }

  return (
    <FluentProvider theme={themeMode === 'tactical-dark' ? webDarkTheme : webLightTheme}>
      <main className="app-shell" data-theme={themeMode}>
        <Topbar
          currentProject={currentProject}
          effectiveViewMode={effectiveViewMode}
          isTacticalDark={themeMode === 'tactical-dark'}
          controls={<StateToolbar viewMode={viewMode} onViewModeChange={setViewMode} />}
          onThemeModeChange={(isTacticalDark) => setThemeMode(isTacticalDark ? 'tactical-dark' : 'light')}
        />

        <section className="metric-grid" aria-label="Dashboard ozeti">
          <MetricCard label="Toplam cihaz" value={stats.totalDevices} tone="neutral" />
          <MetricCard label="Online cihaz" value={stats.onlineDevices} tone="success" />
          <MetricCard label="Aktif alarm" value={stats.activeAlerts} tone="warning" />
          <MetricCard label="Kritik tehdit" value={stats.criticalAlerts} tone="danger" />
        </section>

        <section className="main-operation-grid" aria-label="Ana operasyon alani">
          <aside className="left-panel" aria-label="Cihaz ve proje yonetimi">
            {currentProject ? <ProjectIntakeCard project={currentProject} /> : null}

            {currentProject && moduleVisibility.canUseDeviceSetup ? (
              <DeviceDiscoveryCard
                discoveredDevices={dashboardData.discoveredDevices}
                onRegisterDevice={(input) =>
                  registerDeviceFromDiscovery({
                    ...input,
                    discoveredDevices: dashboardData.discoveredDevices,
                    project: currentProject,
                  })
                }
                onDeviceRegistered={(device) =>
                  setDashboardData((currentData) => ({
                    ...currentData,
                    cameraFeeds: upsertRegisteredCameraFeed(currentData.cameraFeeds, device),
                    devices: currentData.devices.some((candidate) => candidate.id === device.id)
                      ? currentData.devices.map((candidate) => (candidate.id === device.id ? device : candidate))
                      : [...currentData.devices, device],
                  }))
                }
                />
            ) : (
              <Card className="project-card">
                <CardHeader
                  header={<Text weight="semibold">Cihaz kurulumu</Text>}
                  description={<Text size={200}>Kurulum baglami yukleniyor</Text>}
                />
                <ListState
                  message={dashboardLoadState === 'error' ? 'Cihaz kurulum bilgisi yuklenemedi' : 'Cihazlar taraniyor'}
                  tone={dashboardLoadState === 'error' ? 'error' : 'default'}
                />
              </Card>
            )}

          {moduleVisibility.canViewDevices ? (
              <Card className="device-list-card">
                <CardHeader header={<Text weight="semibold">Cihazlar</Text>} />
                <DeviceList
                  devices={filteredDevices}
                  actionDeviceId={actionDeviceId}
                  searchTerm={deviceSearchTerm}
                  statusFilter={deviceStatusFilter}
                  viewMode={effectiveViewMode}
                  onDeleteDevice={(device) => void handleDeleteDevice(device)}
                  onDisconnectDevice={(device) => void handleDisconnectDevice(device)}
                  onSearchTermChange={setDeviceSearchTerm}
                  onStatusFilterChange={setDeviceStatusFilter}
                />
              </Card>
          ) : null}
          </aside>

          <section className="content" aria-label="Taktik harita">
              {moduleVisibility.canViewMap ? (
                <Card className="map-panel">
                  <CardHeader
                    header={<Text weight="semibold">Kayitli cihaz alani</Text>}
                    description={<Text size={200}>Kaydettigin cihazlar harita/listede gorunur</Text>}
                  />
                  <MapPanelContent
                    alerts={filteredAlerts}
                    devices={visibleData.devices}
                    incidents={dashboardData.incidents}
                    viewMode={effectiveViewMode}
                  />
                </Card>
              ) : null}
          </section>

          <aside className="right-panel" aria-label="Kanit ve alarm yonetimi">
            {moduleVisibility.canViewCameraFeeds ? <CameraFeedCard cameraFeeds={dashboardData.cameraFeeds} /> : null}
            <AlarmFeedCard alerts={filteredAlerts} devices={visibleData.devices} incidents={dashboardData.incidents} />

            <section className="right-tab-card" aria-label="Alarm ve olay dosyalari">
              <div className="panel-heading">
                <Text weight="semibold">Alarm ve olay dosyalari</Text>
                <Text className="muted" size={200}>
                  Ham alarm veya korele incident gorunumu
                </Text>
              </div>
              <div className="right-tabs" role="tablist" aria-label="Alarm ve incident sekmeleri">
                <Button
                  appearance={rightPanelTab === 'alerts' ? 'primary' : 'secondary'}
                  role="tab"
                  aria-selected={rightPanelTab === 'alerts'}
                  onClick={() => setRightPanelTab('alerts')}
                >
                  Alarmlar
                </Button>
                <Button
                  appearance={rightPanelTab === 'incidents' ? 'primary' : 'secondary'}
                  role="tab"
                  aria-selected={rightPanelTab === 'incidents'}
                  onClick={() => setRightPanelTab('incidents')}
                >
                  Olay dosyalari
                </Button>
              </div>

              {rightPanelTab === 'alerts' && moduleVisibility.canViewAlerts ? (
                <AlertList
                  alerts={filteredAlerts}
                  severityFilter={alertSeverityFilter}
                  viewMode={effectiveViewMode}
                  onSeverityFilterChange={setAlertSeverityFilter}
                />
              ) : null}

              {rightPanelTab === 'incidents' && moduleVisibility.canViewIncidents ? (
                <IncidentList
                  incidents={dashboardData.incidents}
                  onRequestCameraCommand={handleRequestCameraCommand}
                  onReviewIncident={async (incident, input) => {
                    const updatedIncident = await updateIncidentReview({
                      incident,
                      ...input,
                    })

                    setDashboardData((currentData) => ({
                      ...currentData,
                      incidents: currentData.incidents.map((candidate) =>
                        candidate.id === updatedIncident.id ? updatedIncident : candidate,
                      ),
                    }))
                  }}
                />
              ) : null}
            </section>
          </aside>
        </section>

        <section className="bottom-panel" aria-label="RF waterfall ve timeline alani">
          <div className="bottom-panel-ppi">
            <RadarPpiPanel events={dashboardData.sensorEvents} />
          </div>

          <div className="bottom-sensor-panel">
            {moduleVisibility.canUseSensorTester ? (
              <SensorEventTester
                cameraFeeds={dashboardData.cameraFeeds}
                devices={dashboardData.devices}
                onCreateEvent={ingestSensorEvent}
                onEventCreated={(event) =>
                  setDashboardData((currentData) => {
                    const sensorEvents = [event, ...currentData.sensorEvents]

                    return {
                      ...currentData,
                      incidents: buildIncidentsFromSensorEvents(sensorEvents, currentData.devices),
                      sensorEvents,
                    }
                  })
                }
              />
            ) : null}

            {moduleVisibility.canViewSensorEvents ? <SensorEventList events={dashboardData.sensorEvents} /> : null}
          </div>

          <Card className="timeline-placeholder">
            <CardHeader
              header={<Text weight="semibold">RF / Timeline</Text>}
              description={<Text size={200}>Waterfall ve zaman cizelgesi icin ayrilmis alt panel</Text>}
            />
            <div className="timeline-grid" aria-hidden="true" />
          </Card>
        </section>
      </main>
    </FluentProvider>
  )
}

function upsertRegisteredCameraFeed(
  cameraFeeds: MockDashboardData['cameraFeeds'],
  device: Device,
): MockDashboardData['cameraFeeds'] {
  const cameraFeed = createCameraFeedForRegisteredDevice(device)

  if (!cameraFeed) {
    return cameraFeeds
  }

  return cameraFeeds.some((candidate) => candidate.id === cameraFeed.id)
    ? cameraFeeds.map((candidate) => (candidate.id === cameraFeed.id ? cameraFeed : candidate))
    : [cameraFeed, ...cameraFeeds]
}
