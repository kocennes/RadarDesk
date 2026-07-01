import { Button, Text } from '@fluentui/react-components'
import type { DashboardViewMode } from './dashboardViewState'

export type StateToolbarProps = {
  viewMode: DashboardViewMode
  onViewModeChange: (viewMode: DashboardViewMode) => void
}

const viewModeOptions: DashboardViewMode[] = ['success', 'loading', 'empty', 'error']

export function StateToolbar({ onViewModeChange, viewMode }: StateToolbarProps) {
  return (
    <section className="state-toolbar" aria-label="Demo state controls">
      <Text className="muted" size={200}>
        UI state:
      </Text>
      {viewModeOptions.map((option) => (
        <Button
          appearance={viewMode === option ? 'primary' : 'secondary'}
          key={option}
          onClick={() => onViewModeChange(option)}
        >
          {getViewModeButtonLabel(option)}
        </Button>
      ))}
    </section>
  )
}

function getViewModeButtonLabel(viewMode: DashboardViewMode): string {
  return viewMode[0].toUpperCase() + viewMode.slice(1)
}
