import { Badge, Switch, Text, Title2 } from '@fluentui/react-components'
import type { Project } from '../../types/domain'
import type { DashboardViewMode } from '../../features/dashboard/dashboardViewState'
import { getDashboardViewLabel } from '../../features/dashboard/dashboardViewState'
import { ButtonInfo } from '../ui/ButtonInfo'

interface TopbarProps {
  currentProject: Project | undefined
  effectiveViewMode: DashboardViewMode
  isTacticalDark: boolean
  onThemeModeChange: (isTacticalDark: boolean) => void
}

export function Topbar({ currentProject, effectiveViewMode, isTacticalDark, onThemeModeChange }: TopbarProps) {
  return (
    <header className="topbar">
      <div>
        <Title2>Cihaz Kurulumu</Title2>
        <Text className="muted">
          {currentProject ? 'Once cihazi sec, sonra sahadaki gorevine gore adlandir' : 'Kurulum baglami yukleniyor'}
        </Text>
      </div>
      <div className="topbar-actions">
        <div className="button-with-info">
          <Switch
            checked={isTacticalDark}
            label="Tactical Dark"
            onChange={(_, data) => onThemeModeChange(data.checked)}
          />
          <ButtonInfo label="Operasyon ekranini koyu tactical tema veya aydinlik tema arasinda degistirir." />
        </div>
        <Badge appearance="filled" color="brand">
          {getDashboardViewLabel(effectiveViewMode)}
        </Badge>
      </div>
    </header>
  )
}
