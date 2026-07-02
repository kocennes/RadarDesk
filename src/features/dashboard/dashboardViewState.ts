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
    return 'Yukleniyor'
  }

  if (mode === 'empty') {
    return 'Veri yok'
  }

  if (mode === 'error') {
    return 'Hata'
  }

  return 'Mock data'
}
