import { describe, expect, test } from 'bun:test'
import { formatPeriod, formatDuration, computeProjectDates } from './project-dates.js'

describe('formatPeriod', () => {
  test('empty startDate returns empty', () => {
    expect(formatPeriod('', null)).toBe('')
    expect(formatPeriod(null, null)).toBe('')
  })

  test('only startDate returns the year', () => {
    expect(formatPeriod('2025-03-15', null)).toBe('2025')
  })

  test('same year returns single year', () => {
    expect(formatPeriod('2025-01-10', '2025-06-30')).toBe('2025')
  })

  test('different years returns range', () => {
    expect(formatPeriod('2023-09-01', '2025-06-30')).toBe('2023 – 2025')
  })
})

describe('formatDuration', () => {
  test('no startDate returns empty', () => {
    expect(formatDuration('', null)).toBe('')
  })

  test('no endDate returns En cours', () => {
    expect(formatDuration('2025-01-01', null)).toBe('En cours')
  })

  test('same day returns empty', () => {
    expect(formatDuration('2025-01-01', '2025-01-01')).toBe('')
  })

  test('under 45 days returns days', () => {
    expect(formatDuration('2025-01-01', '2025-02-01')).toBe('31 j.')
  })

  test('over 45 days returns months', () => {
    expect(formatDuration('2025-01-01', '2025-06-15')).toBe('5 mois')
  })

  test('exactly 2 years', () => {
    expect(formatDuration('2023-01-01', '2025-01-01')).toBe('2 ans')
  })

  test('2 years and some months', () => {
    expect(formatDuration('2023-01-01', '2025-06-01')).toBe('2 ans 5 mois')
  })
})

describe('computeProjectDates', () => {
  test('no startDate returns unchanged project', () => {
    const p = { id: 'x', name: 'X' }
    expect(computeProjectDates(p)).toBe(p)
  })

  test('adds computed period and duration', () => {
    const p = computeProjectDates({ id: 'x', name: 'X', startDate: '2024-09-01', endDate: null })
    expect(p.period).toBe('2024')
    expect(p.duration).toBe('En cours')
  })

  test('appends, does not mutate original', () => {
    const orig = { id: 'x', startDate: '2023-01-01', endDate: '2025-12-31' }
    const computed = computeProjectDates(orig)
    expect(computed).not.toBe(orig)
    expect(computed.period).toBe('2023 – 2025')
    expect(computed.duration).toBe('3 ans')
  })
})
