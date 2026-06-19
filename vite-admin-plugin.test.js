import { describe, expect, test } from 'bun:test'
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs'
import { join } from 'node:path'

import {
  getConfigFilePath,
  getProjectsDirPath,
  getProjectsOrderPath,
  getProjectDirPath,
  getProjectJsonPath,
  getProjectCaseStudyPath,
  sanitizeProjectId,
  parseConfigBody,
  readProjectOrder,
  updateProjectOrder,
  buildProjectIndex,
} from './vite-admin-plugin.ts'

const TMP = join(import.meta.dir, '..', '.tmp-plugin-test')
const root = TMP

function setupTmp() {
  rmSync(TMP, { recursive: true, force: true })
  mkdirSync(TMP, { recursive: true })
}

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

describe('path helpers', () => {
  test('getProjectsDirPath returns content/projects under root', () => {
    expect(getProjectsDirPath('/app')).toBe('/app/content/projects')
  })

  test('getProjectsOrderPath returns content/projects/order.json', () => {
    expect(getProjectsOrderPath('/app')).toBe('/app/content/projects/order.json')
  })

  test('getProjectDirPath returns project folder', () => {
    expect(getProjectDirPath('/app', 'my-proj')).toBe('/app/content/projects/my-proj')
  })

  test('getProjectJsonPath returns project.json inside folder', () => {
    expect(getProjectJsonPath('/app', 'my-proj')).toBe('/app/content/projects/my-proj/project.json')
  })

  test('getProjectCaseStudyPath returns case-study.md inside folder', () => {
    expect(getProjectCaseStudyPath('/app', 'my-proj')).toBe('/app/content/projects/my-proj/case-study.md')
  })
})

describe('sanitizeProjectId', () => {
  test('lowercases and replaces non-alnum with dashes', () => {
    expect(sanitizeProjectId('Connect IN')).toBe('connect-in')
  })

  test('strips leading and trailing dashes', () => {
    expect(sanitizeProjectId('-hello-')).toBe('hello')
    expect(sanitizeProjectId('_test_')).toBe('test')
  })

  test('rejects non-strings', () => {
    expect(sanitizeProjectId(42)).toBe('')
    expect(sanitizeProjectId(null)).toBe('')
  })

  test('blocks path traversal', () => {
    const id = sanitizeProjectId('../etc/passwd')
    expect(id).not.toContain('..')
    expect(id).not.toContain('/')
  })
})

describe('order persistence', () => {
  test('readProjectOrder returns [] when order.json is missing', () => {
    setupTmp()
    expect(readProjectOrder(root)).toEqual([])
  })

  test('readProjectOrder returns parsed array', () => {
    setupTmp()
    const orderPath = getProjectsOrderPath(root)
    mkdirSync(join(root, 'content', 'projects'), { recursive: true })
    writeFileSync(orderPath, '["a","b"]', 'utf8')
    expect(readProjectOrder(root)).toEqual(['a', 'b'])
  })

  test('updateProjectOrder save appends new ids', () => {
    expect(updateProjectOrder(['a', 'b'], 'c', 'save')).toEqual(['a', 'b', 'c'])
  })

  test('updateProjectOrder save does not duplicate existing id', () => {
    expect(updateProjectOrder(['a', 'b'], 'a', 'save')).toEqual(['a', 'b'])
  })

  test('updateProjectOrder delete removes id', () => {
    expect(updateProjectOrder(['a', 'b', 'c'], 'b', 'delete')).toEqual(['a', 'c'])
  })

  test('updateProjectOrder handles empty order on save', () => {
    expect(updateProjectOrder([], 'x', 'save')).toEqual(['x'])
  })

  test('updateProjectOrder handles empty order on delete', () => {
    expect(updateProjectOrder([], 'x', 'delete')).toEqual([])
  })
})

describe('buildProjectIndex', () => {
  test('writes index.json from project folders and order', () => {
    setupTmp()
    const projDir = getProjectDirPath(root, 'demo')
    mkdirSync(projDir, { recursive: true })

    writeFileSync(getProjectJsonPath(root, 'demo'), JSON.stringify({ id: 'demo', title: 'Demo' }, null, 2), 'utf8')
    writeFileSync(getProjectCaseStudyPath(root, 'demo'), '# Hello\n\nWorld', 'utf8')

    const orderPath = getProjectsOrderPath(root)
    mkdirSync(join(root, 'content', 'projects'), { recursive: true })
    writeFileSync(orderPath, JSON.stringify(['demo'], null, 2), 'utf8')

    buildProjectIndex(root)

    const indexRaw = readFileSync(join(root, 'content', 'projects', 'index.json'), 'utf8')
    const index = JSON.parse(indexRaw)
    expect(index.length).toBe(1)
    expect(index[0].id).toBe('demo')
    expect(index[0].title).toBe('Demo')
    expect(index[0].caseStudy).toBe('# Hello\n\nWorld')
  })
})
