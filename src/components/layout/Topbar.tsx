import { useEffect, useState, type ReactNode } from 'react'
import {
  Badge,
  Button,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  Select,
  Switch,
  Text,
} from '@fluentui/react-components'
import type { Project } from '../../types/domain'
import type { DashboardViewMode } from '../../features/dashboard/dashboardViewState'
import { getDashboardViewLabel } from '../../features/dashboard/dashboardViewState'
import { ButtonInfo } from '../ui/ButtonInfo'

interface TopbarProps {
  currentProject: Project | undefined
  effectiveViewMode: DashboardViewMode
  isTacticalDark: boolean
  controls: ReactNode
  onThemeModeChange: (isTacticalDark: boolean) => void
}

export function Topbar({
  controls,
  currentProject,
  effectiveViewMode,
  isTacticalDark,
  onThemeModeChange,
}: TopbarProps) {
  const [now, setNow] = useState<Date>(() => new Date())

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(new Date()), 1000)

    return () => window.clearInterval(intervalId)
  }, [])

  return (
    <header className="topbar">
      <div className="topbar-brand" aria-label="Uygulama kimligi">
        <div className="brand-mark" aria-hidden="true">
          B
        </div>
        <div className="brand-copy">
          <Text weight="semibold">BISAVUNMA</Text>
          <Text className="muted" size={200}>
            NEXUS C2
          </Text>
        </div>
        <Badge appearance="outline">V1.0.0</Badge>
      </div>

      <div className="topbar-center">
        <Select
          aria-label="Aktif proje"
          className="project-select"
          disabled={!currentProject}
          value={currentProject?.id ?? ''}
        >
          <option value={currentProject?.id ?? ''}>{currentProject?.name ?? 'Proje yukleniyor'}</option>
        </Select>
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
        {controls}
      </div>

      <div className="topbar-actions">
        <div className="clock-block" aria-label="Sistem saati">
          <Text size={200} weight="semibold">
            {formatLocalTime(now)}
          </Text>
          <Text className="muted" size={100}>
            UTC {formatUtcTime(now)}
          </Text>
        </div>
        <Menu>
          <MenuTrigger disableButtonEnhancement>
            <Button appearance="secondary">Operator</Button>
          </MenuTrigger>
          <MenuPopover>
            <MenuList>
              <MenuItem disabled>Training Operator</MenuItem>
              <MenuItem>Çıkış Yap</MenuItem>
            </MenuList>
          </MenuPopover>
        </Menu>
      </div>
    </header>
  )
}

function formatLocalTime(date: Date): string {
  return new Intl.DateTimeFormat('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date)
}

function formatUtcTime(date: Date): string {
  return new Intl.DateTimeFormat('tr-TR', {
    hour: '2-digit',
    hour12: false,
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'UTC',
  }).format(date)
}
