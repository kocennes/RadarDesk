import { useEffect, useState } from 'react'
import { Badge, Button, Card, CardHeader, FluentProvider, Text, Title2, webLightTheme } from '@fluentui/react-components'
import { ListState } from '../components/ui/ListState'
import { AlertList } from '../features/alerts/AlertList'
import { filterAlerts, type AlertSeverityFilter } from '../features/alerts/alertFilters'
import { getDashboardStats } from '../features/dashboard/dashboardMetrics'
import {
  getDashboardViewData,
  getDashboardViewLabel,
  type DashboardViewMode,
} from '../features/dashboard/dashboardViewState'
import { MetricCard } from '../features/dashboard/MetricCard'
import { StateToolbar } from '../features/dashboard/StateToolbar'
import { DeviceList } from '../features/devices/DeviceList'
import { filterDevices, type DeviceStatusFilter } from '../features/devices/deviceFilters'
import { MapPanelContent } from '../features/map/MapPanelContent'
import { ProjectIntakeCard } from '../features/projects/ProjectIntakeCard'
import { fetchDashboardData } from '../services/apiClient'
import type { MockDashboardData } from '../services/mockApi'
import './App.css'

const emptyDashboardData: MockDashboardData = {
  devices: [],
  alerts: [],
  projects: [],
  users: [],
}

type DashboardLoadState = 'loading' | 'success' | 'error'

export function App() {
  const [dashboardData, setDashboardData] = useState<MockDashboardData>(emptyDashboardData)
  const [dashboardLoadState, setDashboardLoadState] = useState<DashboardLoadState>('loading')
  const [viewMode, setViewMode] = useState<DashboardViewMode>('success')
  const [deviceSearchTerm, setDeviceSearchTerm] = useState<string>('')
  const [deviceStatusFilter, setDeviceStatusFilter] = useState<DeviceStatusFilter>('all')
  const [alertSeverityFilter, setAlertSeverityFilter] = useState<AlertSeverityFilter>('all')

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

  return (
    <FluentProvider theme={webLightTheme}>
      <main className="app-shell">
        <aside className="sidebar" aria-label="Device navigation">
          <div>
            <Text size={600} weight="semibold">
              RadarDesk
            </Text>
            <Text className="muted" size={200}>
              UI-first operations demo
            </Text>
          </div>

          <nav className="nav-list" aria-label="Main sections">
            <Button appearance="primary">Dashboard</Button>
            <Button appearance="subtle" disabled>
              Devices
            </Button>
            <Button appearance="subtle" disabled>
              Projects
            </Button>
            <Button appearance="subtle" disabled>
              Reports
            </Button>
          </nav>
        </aside>

        <section className="content">
          <header className="topbar">
            <div>
              <Title2>Operations Dashboard</Title2>
              <Text className="muted">
                {currentProject ? `${currentProject.customer} / ${currentProject.site}` : 'Loading project context'}
              </Text>
            </div>
            <div className="topbar-actions">
              <Badge appearance="filled" color="brand">
                {getDashboardViewLabel(effectiveViewMode)}
              </Badge>
            </div>
          </header>

          <StateToolbar viewMode={viewMode} onViewModeChange={setViewMode} />

          <section className="metric-grid" aria-label="Dashboard summary">
            <MetricCard label="Total devices" value={stats.totalDevices} tone="neutral" />
            <MetricCard label="Online devices" value={stats.onlineDevices} tone="success" />
            <MetricCard label="Active alerts" value={stats.activeAlerts} tone="warning" />
            <MetricCard label="Critical" value={stats.criticalAlerts} tone="danger" />
          </section>

          <section className="workspace">
            <Card className="map-panel">
              <CardHeader
                header={<Text weight="semibold">Live area view</Text>}
                description={<Text size={200}>Leaflet map with mock device ranges</Text>}
              />
              <MapPanelContent alerts={filteredAlerts} devices={visibleData.devices} viewMode={effectiveViewMode} />
            </Card>

            {currentProject ? (
              <ProjectIntakeCard project={currentProject} />
            ) : (
              <Card className="project-card">
                <CardHeader
                  header={<Text weight="semibold">Project intake</Text>}
                  description={<Text size={200}>Validated frontend form shell</Text>}
                />
                <ListState
                  message={
                    dashboardLoadState === 'error' ? 'Project context could not be loaded' : 'Loading project context'
                  }
                  tone={dashboardLoadState === 'error' ? 'error' : 'default'}
                />
              </Card>
            )}
          </section>
        </section>

        <aside className="right-panel" aria-label="Alerts and device status">
          <Card>
            <CardHeader header={<Text weight="semibold">Alerts</Text>} />
            <AlertList
              alerts={filteredAlerts}
              severityFilter={alertSeverityFilter}
              viewMode={effectiveViewMode}
              onSeverityFilterChange={setAlertSeverityFilter}
            />
          </Card>

          <Card>
            <CardHeader header={<Text weight="semibold">Devices</Text>} />
            <DeviceList
              devices={filteredDevices}
              searchTerm={deviceSearchTerm}
              statusFilter={deviceStatusFilter}
              viewMode={effectiveViewMode}
              onSearchTermChange={setDeviceSearchTerm}
              onStatusFilterChange={setDeviceStatusFilter}
            />
          </Card>
        </aside>
      </main>
    </FluentProvider>
  )
}
