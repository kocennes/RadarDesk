import { useEffect, useState } from 'react'
import { Card, CardHeader, FluentProvider, Text, webLightTheme } from '@fluentui/react-components'
import { Sidebar } from '../components/layout/Sidebar'
import { Topbar } from '../components/layout/Topbar'
import { ListState } from '../components/ui/ListState'
import { AlertList } from '../features/alerts/AlertList'
import { filterAlerts, type AlertSeverityFilter } from '../features/alerts/alertFilters'
import { CameraFeedCard } from '../features/cameras/CameraFeedCard'
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
import {
  deleteDevice,
  disconnectDevice,
  fetchDashboardData,
  ingestSensorEvent,
  registerDeviceFromDiscovery,
  updateIncidentReview,
} from '../services/apiClient'
import type { MockDashboardData } from '../services/mockApi'
import type { Device } from '../types/domain'
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

export function App() {
  const [dashboardData, setDashboardData] = useState<MockDashboardData>(emptyDashboardData)
  const [dashboardLoadState, setDashboardLoadState] = useState<DashboardLoadState>('loading')
  const [viewMode, setViewMode] = useState<DashboardViewMode>('success')
  const [deviceSearchTerm, setDeviceSearchTerm] = useState<string>('')
  const [deviceStatusFilter, setDeviceStatusFilter] = useState<DeviceStatusFilter>('all')
  const [alertSeverityFilter, setAlertSeverityFilter] = useState<AlertSeverityFilter>('all')
  const [actionDeviceId, setActionDeviceId] = useState<string>()

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

  return (
    <FluentProvider theme={webLightTheme}>
      <main className="app-shell">
        <Sidebar />

        <section className="content">
          <Topbar currentProject={currentProject} effectiveViewMode={effectiveViewMode} />
          <StateToolbar viewMode={viewMode} onViewModeChange={setViewMode} />

          <section className="metric-grid" aria-label="Dashboard ozeti">
            <MetricCard label="Toplam cihaz" value={stats.totalDevices} tone="neutral" />
            <MetricCard label="Online cihaz" value={stats.onlineDevices} tone="success" />
            <MetricCard label="Aktif alarm" value={stats.activeAlerts} tone="warning" />
            <MetricCard label="Kritik" value={stats.criticalAlerts} tone="danger" />
          </section>

          <section className="workspace">
            {moduleVisibility.canViewMap ? (
              <Card className="map-panel">
                <CardHeader
                  header={<Text weight="semibold">Kayitli cihaz alani</Text>}
                  description={<Text size={200}>Kaydettigin cihazlar harita/listede gorunur</Text>}
                />
                <MapPanelContent alerts={filteredAlerts} devices={visibleData.devices} viewMode={effectiveViewMode} />
              </Card>
            ) : null}

            <div className="workspace-lower">
              {currentProject && moduleVisibility.canUseDeviceSetup ? (
                <div className="setup-column">
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
                        devices: currentData.devices.some((candidate) => candidate.id === device.id)
                          ? currentData.devices.map((candidate) => (candidate.id === device.id ? device : candidate))
                          : [...currentData.devices, device],
                      }))
                    }
                  />
                </div>
              ) : !moduleVisibility.canUseDeviceSetup ? (
                <Card className="project-card">
                  <CardHeader
                    header={<Text weight="semibold">Cihaz kurulumu</Text>}
                    description={<Text size={200}>Bu paket cihaz kurulum panelini icermiyor</Text>}
                  />
                  <ListState message="Cihaz kurulumu modulu kapali" tone="default" />
                </Card>
              ) : (
                <Card className="project-card">
                  <CardHeader
                    header={<Text weight="semibold">Cihaz kurulumu</Text>}
                    description={<Text size={200}>Kurulum baglami yukleniyor</Text>}
                  />
                  <ListState
                    message={
                      dashboardLoadState === 'error' ? 'Cihaz kurulum bilgisi yuklenemedi' : 'Cihazlar taraniyor'
                    }
                    tone={dashboardLoadState === 'error' ? 'error' : 'default'}
                  />
                </Card>
              )}

              {currentProject ? <ProjectIntakeCard project={currentProject} /> : null}
            </div>
          </section>
        </section>

        <aside className="right-panel" aria-label="Alarm ve cihaz durumu">
          {moduleVisibility.canViewAlerts ? (
            <Card>
              <CardHeader header={<Text weight="semibold">Alarmlar</Text>} />
              <AlertList
                alerts={filteredAlerts}
                severityFilter={alertSeverityFilter}
                viewMode={effectiveViewMode}
                onSeverityFilterChange={setAlertSeverityFilter}
              />
            </Card>
          ) : null}

          {moduleVisibility.canViewCameraFeeds ? <CameraFeedCard cameraFeeds={dashboardData.cameraFeeds} /> : null}

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

          {moduleVisibility.canViewIncidents ? (
            <IncidentList
              incidents={dashboardData.incidents}
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

          {moduleVisibility.canViewSensorEvents ? <SensorEventList events={dashboardData.sensorEvents} /> : null}

          {moduleVisibility.canViewDevices ? (
            <Card>
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
      </main>
    </FluentProvider>
  )
}
