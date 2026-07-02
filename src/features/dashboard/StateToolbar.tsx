import { Button, Text } from '@fluentui/react-components'
import { ButtonInfo } from '../../components/ui/ButtonInfo'
import type { DashboardViewMode } from './dashboardViewState'

export type StateToolbarProps = {
  viewMode: DashboardViewMode
  onViewModeChange: (viewMode: DashboardViewMode) => void
}

const viewModeOptions: DashboardViewMode[] = ['success', 'loading', 'empty', 'error']

export function StateToolbar({ onViewModeChange, viewMode }: StateToolbarProps) {
  return (
    <section className="state-toolbar" aria-label="UI durum kontrolleri">
      <Text className="muted" size={200}>
        UI durumu:
      </Text>
      {viewModeOptions.map((option) => (
        <div className="button-with-info" key={option}>
          <Button
            appearance={viewMode === option ? 'primary' : 'secondary'}
            onClick={() => onViewModeChange(option)}
          >
            {getViewModeButtonLabel(option)}
          </Button>
          <ButtonInfo label={getViewModeButtonDescription(option)} />
        </div>
      ))}
    </section>
  )
}

function getViewModeButtonLabel(viewMode: DashboardViewMode): string {
  const labels: Record<DashboardViewMode, string> = {
    empty: 'Veri yok',
    error: 'Hata',
    loading: 'Yukleniyor',
    success: 'Mock data',
  }

  return labels[viewMode]
}

function getViewModeButtonDescription(viewMode: DashboardViewMode): string {
  const descriptions: Record<DashboardViewMode, string> = {
    empty: 'Dashboardu veri yok durumunda gosterir; bos liste ve bos ekran davranisini test etmek icindir.',
    error: 'Dashboardu hata durumunda gosterir; veri yuklenemediginde kullaniciya ne gorunecegini test eder.',
    loading: 'Dashboardu yukleniyor durumunda gosterir; veri beklerken spinner ve bekleme mesajlarini kontrol eder.',
    success: 'Dashboardu normal calisan mock operasyon verileriyle gosterir.',
  }

  return descriptions[viewMode]
}
