import { describe, expect, it } from 'vitest'
import { formatDisplayTime } from './formatters'

describe('formatters', () => {
  it('trims display time values', () => {
    expect(formatDisplayTime(' 14:18 ')).toBe('14:18')
  })

  it('uses a safe fallback for empty time values', () => {
    expect(formatDisplayTime('   ')).toBe('Bilinmeyen zaman')
  })
})
