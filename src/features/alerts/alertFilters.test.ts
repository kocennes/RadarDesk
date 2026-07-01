import { describe, expect, it } from 'vitest'
import { alerts } from '../../mocks/alerts'
import { filterAlerts } from './alertFilters'

describe('filterAlerts', () => {
  it('returns all alerts when severity is all', () => {
    expect(filterAlerts(alerts, 'all')).toHaveLength(3)
  })

  it('filters alerts by severity', () => {
    const result = filterAlerts(alerts, 'critical')

    expect(result.map((alert) => alert.id)).toEqual(['alert-1001'])
  })

  it('returns an empty list when no alert matches', () => {
    expect(filterAlerts(alerts, 'low')).toEqual([])
  })
})
