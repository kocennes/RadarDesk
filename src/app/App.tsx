import { Suspense, lazy, useState, type ChangeEvent, type FormEvent } from 'react'
import {
  Badge,
  Button,
  Card,
  CardHeader,
  Field,
  FluentProvider,
  Input,
  Select,
  Spinner,
  Text,
  Title2,
  webLightTheme,
} from '@fluentui/react-components'
import type { Alert, AlertSeverity, Device, DeviceStatus } from '../types/domain'
import { alerts } from '../mocks/alerts'
import { devices } from '../mocks/devices'
import { projects } from '../mocks/projects'
import { getDashboardStats } from '../features/dashboard/dashboardMetrics'
import {
  getDashboardViewData,
  getDashboardViewLabel,
  type DashboardViewMode,
} from '../features/dashboard/dashboardViewState'
import {
  filterAlerts,
  type AlertSeverityFilter,
} from '../features/alerts/alertFilters'
import {
  filterDevices,
  type DeviceStatusFilter,
} from '../features/devices/deviceFilters'
import {
  createProjectDraft,
  hasProjectDraftErrors,
  validateProjectDraft,
  type ProjectDraft,
  type ProjectDraftErrors,
} from '../features/projects/projectForm'
import './App.css'

const OperationsMap = lazy(() =>
  import('../features/map/OperationsMap').then((module) => ({
    default: module.OperationsMap,
  })),
)

const deviceStatusColor: Record<DeviceStatus, 'success' | 'warning' | 'danger' | 'subtle'> = {
  online: 'success',
  warning: 'warning',
  alarm: 'danger',
  offline: 'subtle',
}

const alertSeverityColor: Record<AlertSeverity, 'informative' | 'warning' | 'danger' | 'important'> = {
  low: 'informative',
  medium: 'warning',
  high: 'danger',
  critical: 'important',
}

export function App() {
  const [viewMode, setViewMode] = useState<DashboardViewMode>('success')
  const visibleData = getDashboardViewData(viewMode, devices, alerts)
  const stats = getDashboardStats(visibleData.devices, visibleData.alerts)
  const currentProject = projects[0]
  const [projectDraft, setProjectDraft] = useState<ProjectDraft>(() => createProjectDraft(currentProject))
  const [projectErrors, setProjectErrors] = useState<ProjectDraftErrors>({})
  const [saveMessage, setSaveMessage] = useState<string>('')
  const [deviceSearchTerm, setDeviceSearchTerm] = useState<string>('')
  const [deviceStatusFilter, setDeviceStatusFilter] = useState<DeviceStatusFilter>('all')
  const [alertSeverityFilter, setAlertSeverityFilter] = useState<AlertSeverityFilter>('all')
  const filteredAlerts = filterAlerts(visibleData.alerts, alertSeverityFilter)
  const filteredDevices = filterDevices(visibleData.devices, {
    searchTerm: deviceSearchTerm,
    status: deviceStatusFilter,
  })

  function handleProjectFieldChange(field: keyof ProjectDraft, value: string) {
    setProjectDraft((draft) => ({
      ...draft,
      [field]: value,
    }))

    setProjectErrors((errors) => ({
      ...errors,
      [field]: undefined,
    }))
    setSaveMessage('')
  }

  function handleProjectStatusChange(event: ChangeEvent<HTMLSelectElement>) {
    handleProjectFieldChange('status', event.target.value as ProjectDraft['status'])
  }

  function handleProjectSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const errors = validateProjectDraft(projectDraft)
    setProjectErrors(errors)

    if (hasProjectDraftErrors(errors)) {
      setSaveMessage('')
      return
    }

    setSaveMessage('Draft saved locally. Backend connection will come later.')
  }

  function handleDeviceStatusFilterChange(event: ChangeEvent<HTMLSelectElement>) {
    setDeviceStatusFilter(event.target.value as DeviceStatusFilter)
  }

  function handleAlertSeverityFilterChange(event: ChangeEvent<HTMLSelectElement>) {
    setAlertSeverityFilter(event.target.value as AlertSeverityFilter)
  }

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
            <Button appearance="subtle">Devices</Button>
            <Button appearance="subtle">Projects</Button>
            <Button appearance="subtle">Reports</Button>
          </nav>
        </aside>

        <section className="content">
          <header className="topbar">
            <div>
              <Title2>Operations Dashboard</Title2>
              <Text className="muted">
                {currentProject.customer} / {currentProject.site}
              </Text>
            </div>
            <div className="topbar-actions">
              <Badge appearance="filled" color="brand">
                {getDashboardViewLabel(viewMode)}
              </Badge>
            </div>
          </header>

          <section className="state-toolbar" aria-label="Demo state controls">
            <Text className="muted" size={200}>
              UI state:
            </Text>
            <Button
              appearance={viewMode === 'success' ? 'primary' : 'secondary'}
              onClick={() => setViewMode('success')}
            >
              Success
            </Button>
            <Button
              appearance={viewMode === 'loading' ? 'primary' : 'secondary'}
              onClick={() => setViewMode('loading')}
            >
              Loading
            </Button>
            <Button
              appearance={viewMode === 'empty' ? 'primary' : 'secondary'}
              onClick={() => setViewMode('empty')}
            >
              Empty
            </Button>
            <Button
              appearance={viewMode === 'error' ? 'primary' : 'secondary'}
              onClick={() => setViewMode('error')}
            >
              Error
            </Button>
          </section>

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
              <MapPanelContent devices={visibleData.devices} viewMode={viewMode} />
            </Card>

            <Card className="project-card">
              <CardHeader
                header={<Text weight="semibold">Project intake</Text>}
                description={<Text size={200}>Validated frontend form shell</Text>}
              />
              <form className="form-grid" onSubmit={handleProjectSubmit}>
                <Field
                  label="Project name"
                  required
                  validationMessage={projectErrors.name}
                  validationState={projectErrors.name ? 'error' : 'none'}
                >
                  <Input
                    value={projectDraft.name}
                    onChange={(event) => handleProjectFieldChange('name', event.target.value)}
                  />
                </Field>
                <Field
                  label="Customer"
                  required
                  validationMessage={projectErrors.customer}
                  validationState={projectErrors.customer ? 'error' : 'none'}
                >
                  <Input
                    value={projectDraft.customer}
                    onChange={(event) => handleProjectFieldChange('customer', event.target.value)}
                  />
                </Field>
                <Field
                  label="Site"
                  validationMessage={projectErrors.site}
                  validationState={projectErrors.site ? 'error' : 'none'}
                >
                  <Input
                    value={projectDraft.site}
                    onChange={(event) => handleProjectFieldChange('site', event.target.value)}
                  />
                </Field>
                <Field label="Priority">
                  <Select value={projectDraft.status} onChange={handleProjectStatusChange}>
                    <option value="draft">Draft</option>
                    <option value="survey">Survey</option>
                    <option value="active">Active</option>
                  </Select>
                </Field>
                {saveMessage ? (
                  <div className="form-success" role="status">
                    <Text weight="semibold">{saveMessage}</Text>
                  </div>
                ) : null}
                <Button appearance="primary" type="submit">
                  Save draft
                </Button>
              </form>
            </Card>
          </section>
        </section>

        <aside className="right-panel" aria-label="Alerts and device status">
          <Card>
            <CardHeader header={<Text weight="semibold">Alerts</Text>} />
            <AlertList
              alerts={filteredAlerts}
              severityFilter={alertSeverityFilter}
              viewMode={viewMode}
              onSeverityFilterChange={handleAlertSeverityFilterChange}
            />
          </Card>

          <Card>
            <CardHeader header={<Text weight="semibold">Devices</Text>} />
            <DeviceList
              devices={filteredDevices}
              searchTerm={deviceSearchTerm}
              statusFilter={deviceStatusFilter}
              viewMode={viewMode}
              onSearchTermChange={setDeviceSearchTerm}
              onStatusFilterChange={handleDeviceStatusFilterChange}
            />
          </Card>
        </aside>
      </main>
    </FluentProvider>
  )
}

type MetricCardProps = {
  label: string
  value: number
  tone: 'neutral' | 'success' | 'warning' | 'danger'
}

function MetricCard({ label, value, tone }: MetricCardProps) {
  return (
    <Card className={`metric-card metric-${tone}`}>
      <Text className="muted" size={200}>
        {label}
      </Text>
      <Text size={700} weight="semibold">
        {value}
      </Text>
    </Card>
  )
}

type ViewModeProps = {
  viewMode: DashboardViewMode
}

type MapPanelContentProps = ViewModeProps & {
  devices: Device[]
}

function MapPanelContent({ devices, viewMode }: MapPanelContentProps) {
  if (viewMode === 'loading') {
    return (
      <div className="map-surface state-surface">
        <Spinner label="Loading operation picture" />
      </div>
    )
  }

  if (viewMode === 'error') {
    return (
      <div className="map-surface state-surface">
        <Text size={500} weight="semibold">
          Operation feed unavailable
        </Text>
        <Text className="muted">The UI can still render a safe error state without backend data.</Text>
      </div>
    )
  }

  if (viewMode === 'empty') {
    return (
      <div className="map-surface state-surface">
        <Text size={500} weight="semibold">
          No active coverage yet
        </Text>
        <Text className="muted">Add mock devices or connect an API to populate this view.</Text>
      </div>
    )
  }

  return (
    <div className="map-surface" aria-label="Mock operation map">
      <Suspense
        fallback={
          <div className="map-surface state-surface map-loading">
            <Spinner label="Loading map module" />
          </div>
        }
      >
        <OperationsMap devices={devices} />
      </Suspense>
    </div>
  )
}

type AlertListProps = ViewModeProps & {
  alerts: Alert[]
  severityFilter: AlertSeverityFilter
  onSeverityFilterChange: (event: ChangeEvent<HTMLSelectElement>) => void
}

function AlertList({ alerts, onSeverityFilterChange, severityFilter, viewMode }: AlertListProps) {
  if (viewMode === 'loading') {
    return <ListState message="Loading alerts" />
  }

  if (viewMode === 'error') {
    return <ListState message="Alerts could not be loaded" tone="error" />
  }

  if (viewMode === 'empty') {
    return <ListState message="No alerts in this demo state" />
  }

  return (
    <div className="stack">
      <div className="panel-filters panel-filters-single">
        <Field label="Severity" size="small">
          <Select aria-label="Filter alerts by severity" value={severityFilter} onChange={onSeverityFilterChange}>
            <option value="all">All</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </Select>
        </Field>
      </div>

      {alerts.length === 0 ? (
        <ListState message="No alerts match this severity" />
      ) : (
        alerts.map((alert) => (
          <div className="alert-row" key={alert.id}>
            <div>
              <Text weight="semibold">{alert.title}</Text>
              <Text className="muted" size={200}>
                {alert.area} / {alert.timestamp}
              </Text>
            </div>
            <Badge color={alertSeverityColor[alert.severity]}>{alert.severity}</Badge>
          </div>
        ))
      )}
    </div>
  )
}

type DeviceListProps = ViewModeProps & {
  devices: Device[]
  searchTerm: string
  statusFilter: DeviceStatusFilter
  onSearchTermChange: (value: string) => void
  onStatusFilterChange: (event: ChangeEvent<HTMLSelectElement>) => void
}

function DeviceList({
  devices,
  onSearchTermChange,
  onStatusFilterChange,
  searchTerm,
  statusFilter,
  viewMode,
}: DeviceListProps) {
  if (viewMode === 'loading') {
    return <ListState message="Loading devices" />
  }

  if (viewMode === 'error') {
    return <ListState message="Devices could not be loaded" tone="error" />
  }

  if (viewMode === 'empty') {
    return <ListState message="No devices connected yet" />
  }

  return (
    <div className="stack">
      <div className="panel-filters device-filters">
        <Field label="Search" size="small">
          <Input
            aria-label="Search devices"
            placeholder="Name, location, type"
            value={searchTerm}
            onChange={(event) => onSearchTermChange(event.target.value)}
          />
        </Field>
        <Field label="Status" size="small">
          <Select aria-label="Filter devices by status" value={statusFilter} onChange={onStatusFilterChange}>
            <option value="all">All</option>
            <option value="online">Online</option>
            <option value="warning">Warning</option>
            <option value="alarm">Alarm</option>
            <option value="offline">Offline</option>
          </Select>
        </Field>
      </div>

      {devices.length === 0 ? (
        <ListState message="No devices match these filters" />
      ) : (
        devices.map((device) => (
          <div className="device-row" key={device.id}>
            <div>
              <Text weight="semibold">{device.name}</Text>
              <Text className="muted" size={200}>
                {device.location} / {device.rangeKm} km
              </Text>
            </div>
            <Badge color={deviceStatusColor[device.status]}>{device.status}</Badge>
          </div>
        ))
      )}
    </div>
  )
}

type ListStateProps = {
  message: string
  tone?: 'default' | 'error'
}

function ListState({ message, tone = 'default' }: ListStateProps) {
  return (
    <div className={`list-state list-state-${tone}`}>
      <Text weight="semibold">{message}</Text>
      <Text className="muted" size={200}>
        This is a frontend state preview.
      </Text>
    </div>
  )
}
