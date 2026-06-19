import { describe, expect, test } from 'bun:test'
import {
  getConfigFilePath,
  parseConfigBody,
  serializeProjectModule,
  projectIdToVariableName,
  buildProjectsIndex,
} from './vite-admin-plugin.ts'

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

describe('project content serialization', () => {
  test('serializes a project as an editable default-export module', () => {
    const project = {
      id: 'connect-in',
      name: "Connect'IN",
      categories: ['dev'],
      featured: true,
      techs: [{ label: 'Laravel', tech: 'laravel' }],
      role: 'Binôme',
      period: '2025',
      duration: '3 sem.',
      description: 'API REST Laravel',
      highlights: ['Auth Sanctum'],
      caseStudy: '## Contexte\n\n![Dashboard](media/projects/connect-in/dashboard.jpg)',
      demoUrl: '',
      repoUrl: 'https://github.com/Sofian-bll',
      image: 'media/projects/connect-in/cover.jpg',
    }

    const source = serializeProjectModule(project)

    expect(source).toContain('export default {')
    expect(source).toContain("id: 'connect-in'")
    expect(source).toContain('caseStudy: `## Contexte')
    expect(source).toContain('media/projects/connect-in/cover.jpg')
    expect(source).toContain('}\n')
  })

  test('escapes template markers inside markdown case studies', () => {
    const source = serializeProjectModule({
      id: 'template-test',
      name: 'Template Test',
      caseStudy: 'Use `code` and ${danger}',
    })

    expect(source).toContain('Use \\`code\\` and \\${danger}')
  })

  test('creates safe import variable names from project ids', () => {
    expect(projectIdToVariableName('connect-in')).toBe('connect_in')
    expect(projectIdToVariableName('3d-seahorse')).toBe('_3d_seahorse')
  })

  test('builds the project index in portfolio order', () => {
    const source = buildProjectsIndex(['connect-in', 'my-cinema'])

    expect(source).toContain("import connect_in from './projects/connect-in.js'")
    expect(source).toContain("import my_cinema from './projects/my-cinema.js'")
    expect(source).toContain('export const projects = [')
    expect(source.indexOf('connect_in')).toBeLessThan(source.indexOf('my_cinema'))
  })
})
