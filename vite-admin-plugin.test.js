import { describe, expect, test } from 'bun:test'
import { getConfigFilePath, parseConfigBody } from './vite-admin-plugin.ts'

describe('parseConfigBody', () => {
  test('validates and formats JSON object payloads', () => {
    expect(parseConfigBody('{"projects":[]}')).toEqual({
      ok: true,
      body: '{\n  "projects": []\n}\n',
    })
  })

  test('rejects invalid JSON and non-object payloads', () => {
    expect(parseConfigBody('{broken')).toEqual({ ok: false, status: 400, error: 'Invalid JSON' })
    expect(parseConfigBody('[]')).toEqual({ ok: false, status: 400, error: 'Expected a JSON object' })
  })

  test('rejects scalar and empty payloads', () => {
    expect(parseConfigBody('')).toEqual({ ok: false, status: 400, error: 'Invalid JSON' })
    expect(parseConfigBody('true')).toEqual({ ok: false, status: 400, error: 'Expected a JSON object' })
    expect(parseConfigBody('"hello"')).toEqual({ ok: false, status: 400, error: 'Expected a JSON object' })
    expect(parseConfigBody('42')).toEqual({ ok: false, status: 400, error: 'Expected a JSON object' })
    expect(parseConfigBody('null')).toEqual({ ok: false, status: 400, error: 'Expected a JSON object' })
  })
})

describe('getConfigFilePath', () => {
  test('resolves config.json from the Vite server root', () => {
    expect(getConfigFilePath('/tmp/bentofolio')).toBe('/tmp/bentofolio/config.json')
  })
})
