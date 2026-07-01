import type { Alert, Device } from '../../types/domain'

export type DashboardViewMode = 'success' | 'loading' | 'empty' | 'error'

export type DashboardViewData = {
  devices: Device[]
  alerts: Alert[]
}

export function getDashboardViewData(
  mode: DashboardViewMode,
  devices: Device[],
  alerts: Alert[],
): DashboardViewData {
  if (mode === 'empty' || mode === 'error') {
    return {
      devices: [],
      alerts: [],
    }
  }

  return {
    devices,
    alerts,
  }
}

export function getDashboardViewLabel(mode: DashboardViewMode): string {
  if (mode === 'loading') {
    return 'Loading demo'
  }

  if (mode === 'empty') {
    return 'Empty demo'
  }

  if (mode === 'error') {
    return 'Error demo'
  }

  return 'Success demo'
}
