import { Suspense, lazy } from 'react'
import { Spinner, Text } from '@fluentui/react-components'
import type { Alert, Device, Incident } from '../../types/domain'
import type { DashboardViewMode } from '../dashboard/dashboardViewState'

const OperationsMap = lazy(() =>
  import('./OperationsMap').then((module) => ({
    default: module.OperationsMap,
  })),
)

export type MapPanelContentProps = {
  alerts: Alert[]
  devices: Device[]
  incidents: Incident[]
  viewMode: DashboardViewMode
}

export function MapPanelContent({ alerts, devices, incidents, viewMode }: MapPanelContentProps) {
  if (viewMode === 'loading') {
    return (
      <div aria-live="polite" className="map-surface state-surface" role="status">
        <Spinner label="Operasyon gorunumu yukleniyor" />
      </div>
    )
  }

  if (viewMode === 'error') {
    return (
      <div aria-live="assertive" className="map-surface state-surface" role="alert">
        <Text size={500} weight="semibold">
          Operasyon verisi kullanilamiyor
        </Text>
        <Text className="muted">UI, backend verisi olmadan da guvenli hata durumunu gosterebilir.</Text>
      </div>
    )
  }

  if (viewMode === 'empty') {
    return (
      <div aria-live="polite" className="map-surface state-surface" role="status">
        <Text size={500} weight="semibold">
          Henuz aktif kapsama yok
        </Text>
        <Text className="muted">Bu gorunumu doldurmak icin mock cihaz ekleyin veya planlanan API kaynagini baglayin.</Text>
      </div>
    )
  }

  return (
    <div className="map-surface" aria-label="Mock data operasyon haritasi">
      <Suspense
        fallback={
          <div aria-live="polite" className="map-surface state-surface map-loading" role="status">
            <Spinner label="Harita modulu yukleniyor" />
          </div>
        }
      >
        <OperationsMap alerts={alerts} devices={devices} incidents={incidents} />
      </Suspense>
    </div>
  )
}
