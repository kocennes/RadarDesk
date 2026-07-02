import { describe, expect, it } from 'vitest'
import { alerts } from '../../mocks/alerts'
import { devices } from '../../mocks/devices'
import type { Incident } from '../../types/domain'
import { buildAlarmFeedItems } from './alarmFeed'

describe('buildAlarmFeedItems', () => {
  it('builds a chronological alarm and incident feed with action text', () => {
    const incidents: Incident[] = [
      {
        id: 'incident-rf-radar',
        confidence: 0.78,
        confirmationLevel: 'multi-sensor',
        createdAt: '2026-07-02T10:35:00.000Z',
        evidenceRefs: [],
        projectId: 'project-001',
        sensorEventIds: ['event-radar', 'event-rf'],
        severity: 'high',
        sourceDeviceIds: ['radar-001', 'rf-002'],
        status: 'reviewing',
        title: 'Coklu sensor olayi',
        updatedAt: '2026-07-02T10:36:00.000Z',
      },
    ]

    const feedItems = buildAlarmFeedItems({ alerts, devices, incidents })

    expect(feedItems[0]).toMatchObject({
      actionText: 'RF sinyali radar track ile eslesti',
      kind: 'incident',
      statusLabel: 'REVIEWING',
    })
    expect(feedItems.some((item) => item.kind === 'alert' && item.actionText === 'Operator incelemesi bekliyor')).toBe(
      true,
    )
  })

  it('renders minor device status items as compact feed entries', () => {
    const feedItems = buildAlarmFeedItems({ alerts: [], devices, incidents: [] })

    expect(feedItems.find((item) => item.id === 'device-radar-001')).toMatchObject({
      compact: true,
      kind: 'device-status',
      severity: 'status',
    })
    expect(feedItems.find((item) => item.id === 'device-rf-002')).toMatchObject({
      compact: false,
      severity: 'medium',
    })
  })
})
