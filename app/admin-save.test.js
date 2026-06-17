import { describe, expect, test } from 'bun:test'
import { clearAdminSaveOverrides, saveConfigToDisk } from './admin-save.js'

describe('saveConfigToDisk', () => {
  test('returns the server JSON payload when config save succeeds', async () => {
    const calls = []
    const payload = { ok: true, savedAt: '2026-06-16T12:00:00.000Z', path: '/repo/config.json' }
    const fetchImpl = async (url, options) => {
      calls.push({ url, options })
      return { ok: true, json: async () => payload }
    }

    await expect(saveConfigToDisk({ projects: [] }, fetchImpl)).resolves.toEqual(payload)
    expect(calls[0].url).toBe('/api/admin/save')
    expect(calls[0].options.method).toBe('POST')
    expect(calls[0].options.headers['Content-Type']).toBe('application/json')
    expect(calls[0].options.body).toBe(JSON.stringify({ projects: [] }, null, 2))
  })

  test('returns a failure object when server rejects the save', async () => {
    const fetchImpl = async () => ({
      ok: false,
      status: 400,
      json: async () => ({ ok: false, error: 'Invalid JSON' }),
    })

    await expect(saveConfigToDisk({ projects: [] }, fetchImpl)).resolves.toEqual({ ok: false, error: 'Invalid JSON' })
  })

  test('returns clear error when response body is not valid JSON', async () => {
    const fetchImpl = async () => ({
      ok: true,
      status: 200,
      json: async () => { throw new Error('Unexpected token') },
    })

    await expect(saveConfigToDisk({ projects: [] }, fetchImpl)).resolves.toEqual({
      ok: false,
      error: 'Server response is not valid JSON',
    })
  })

  test('returns failure when server responds 200 with error envelope', async () => {
    const fetchImpl = async () => ({
      ok: true,
      status: 200,
      json: async () => ({ ok: false, error: 'Write permission denied' }),
    })

    await expect(saveConfigToDisk({ projects: [] }, fetchImpl)).resolves.toEqual({
      ok: false,
      error: 'Write permission denied',
    })
  })

  test('returns failure on network error', async () => {
    const fetchImpl = async () => { throw new Error('NetworkError') }

    await expect(saveConfigToDisk({ projects: [] }, fetchImpl)).resolves.toEqual({
      ok: false,
      error: 'NetworkError',
    })
  })
})

describe('clearAdminSaveOverrides', () => {
  test('clears preview and legacy override keys after a successful save', () => {
    const removed = []
    clearAdminSaveOverrides({ removeItem: (key) => removed.push(key) })

    expect(removed).toEqual([
      'bentofolio.preview',
      'bentofolio.cv.featured',
      'bentofolio.import',
      'bentofolio.photo',
      'bentofolio.cms',
    ])
  })

  test('tolerates null or undefined storage', () => {
    expect(() => clearAdminSaveOverrides(null)).not.toThrow()
    expect(() => clearAdminSaveOverrides(undefined)).not.toThrow()
    expect(() => clearAdminSaveOverrides({})).not.toThrow()
  })

  test('tolerates a storage whose removeItem throws', () => {
    expect(() => clearAdminSaveOverrides({
      removeItem() { throw new Error('blocked') },
    })).not.toThrow()
  })
})
