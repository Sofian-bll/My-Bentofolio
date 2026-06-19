import { describe, expect, test } from 'bun:test'
import { saveProjectToContent, deleteProjectFromContent } from './admin-project-save.js'

const okFetcher = (expectedUrl, expectedBody) => {
  return async (url, init) => {
    expect(url).toBe(expectedUrl)
    expect(JSON.parse(init.body)).toEqual(expectedBody)
    return new Response(JSON.stringify({ ok: true, id: 'demo' }), { status: 200 })
  }
}

const errorFetcher = () => {
  return async () => {
    return new Response(JSON.stringify({ ok: false, error: 'Not found' }), { status: 404 })
  }
}

describe('saveProjectToContent', () => {
  test('posts project to /api/admin/project/save', async () => {
    const project = { id: 'demo', name: 'Demo Project', caseStudy: '# Hello' }
    const result = await saveProjectToContent(
      project,
      okFetcher('/api/admin/project/save', { project }),
    )
    expect(result.ok).toBe(true)
    expect(result.id).toBe('demo')
  })

  test('throws on non-ok response', async () => {
    await expect(saveProjectToContent({ id: 'x' }, errorFetcher())).rejects.toThrow('Not found')
  })
})

describe('deleteProjectFromContent', () => {
  test('posts id to /api/admin/project/delete', async () => {
    const result = await deleteProjectFromContent(
      'demo',
      okFetcher('/api/admin/project/delete', { id: 'demo' }),
    )
    expect(result.ok).toBe(true)
  })

  test('throws on non-ok response', async () => {
    await expect(deleteProjectFromContent('x', errorFetcher())).rejects.toThrow('Not found')
  })
})
