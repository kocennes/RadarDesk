import { Suspense, lazy } from 'react'
import { Spinner, Text } from '@fluentui/react-components'
import type { Alert, Device } from '../../types/domain'
import type { DashboardViewMode } from '../dashboard/dashboardViewState'

const OperationsMap = lazy(() =>
  import('./OperationsMap').then((module) => ({
    default: module.OperationsMap,
  })),
)

export type MapPanelContentProps = {
  alerts: Alert[]
  devices: Device[]
  viewMode: DashboardViewMode
}

export function MapPanelContent({ alerts, devices, viewMode }: MapPanelContentProps) {
  if (viewMode === 'loading') {
    return (
      <div aria-live="polite" className="map-surface state-surface" role="status">
        <Spinner label="Loading operation picture" />
      </div>
    )
  }

  if (viewMode === 'error') {
    return (
      <div aria-live="assertive" className="map-surface state-surface" role="alert">
        <Text size={500} weight="semibold">
          Operation feed unavailable
        </Text>
        <Text className="muted">The UI can still render a safe error state without backend data.</Text>
      </div>
    )
  }

  if (viewMode === 'empty') {
    return (
      <div aria-live="polite" className="map-surface state-surface" role="status">
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
          <div aria-live="polite" className="map-surface state-surface map-loading" role="status">
            <Spinner label="Loading map module" />
          </div>
        }
      >
        <OperationsMap alerts={alerts} devices={devices} />
      </Suspense>
    </div>
  )
}
