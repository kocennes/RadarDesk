import { Badge, Text, Title2 } from '@fluentui/react-components'
import type { Project } from '../../types/domain'
import type { DashboardViewMode } from '../../features/dashboard/dashboardViewState'
import { getDashboardViewLabel } from '../../features/dashboard/dashboardViewState'

interface TopbarProps {
  currentProject: Project | undefined
  effectiveViewMode: DashboardViewMode
}

export function Topbar({ currentProject, effectiveViewMode }: TopbarProps) {
  return (
    <header className="topbar">
      <div>
        <Title2>Cihaz Kurulumu</Title2>
        <Text className="muted">
          {currentProject ? 'Once cihazi sec, sonra sahadaki gorevine gore adlandir' : 'Kurulum baglami yukleniyor'}
        </Text>
      </div>
      <div className="topbar-actions">
        <Badge appearance="filled" color="brand">
          {getDashboardViewLabel(effectiveViewMode)}
        </Badge>
      </div>
    </header>
  )
}
