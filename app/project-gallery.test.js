import { describe, expect, test } from 'bun:test'
import { getProjectGalleryState, sortProjects } from './project-gallery.js'

const categories = {
  dev: { label: 'Dev' },
  '3d': { label: '3D' },
  animation: { label: 'Animation' },
  webdesign: { label: 'Webdesign' },
}

const projects = [
  { id: 'api', categories: ['dev'] },
  { id: 'seahorse', categories: ['3d', 'animation', 'webdesign'] },
  { id: 'landing', categories: ['webdesign'] },
]

describe('getProjectGalleryState', () => {
  test('all filter returns each project once in source order', () => {
    const state = getProjectGalleryState({ projects, categories, filter: 'all' })

    expect(state.activeFilter).toBe('all')
    expect(state.shown.map((project) => project.id)).toEqual(['api', 'seahorse', 'landing'])
  })

  test('category filter still includes multi-category projects', () => {
    const state = getProjectGalleryState({ projects, categories, filter: 'animation' })

    expect(state.activeFilter).toBe('animation')
    expect(state.shown.map((project) => project.id)).toEqual(['seahorse'])
  })

  test('invalid category falls back to all projects', () => {
    const state = getProjectGalleryState({ projects, categories, filter: 'missing' })

    expect(state.activeFilter).toBe('all')
    expect(state.shown).toHaveLength(3)
  })
})

describe('sortProjects', () => {
  const items = [
    { id: 'zoo', name: 'zoo', startDate: '2024-03-01' },
    { id: 'alpha', name: 'alpha', startDate: '2026-01-15' },
    { id: 'mid', name: 'mid', startDate: '2025-06-01' },
  ]

  test('default preserves original order', () => {
    expect(sortProjects(items, 'default').map((p) => p.id)).toEqual(['zoo', 'alpha', 'mid'])
  })

  test('az sorts alphabetically', () => {
    expect(sortProjects(items, 'az').map((p) => p.id)).toEqual(['alpha', 'mid', 'zoo'])
  })

  test('za sorts reverse alphabetically', () => {
    expect(sortProjects(items, 'za').map((p) => p.id)).toEqual(['zoo', 'mid', 'alpha'])
  })

  test('recent sorts by startDate newest first', () => {
    expect(sortProjects(items, 'recent').map((p) => p.id)).toEqual(['alpha', 'mid', 'zoo'])
  })

  test('oldest sorts by startDate oldest first', () => {
    expect(sortProjects(items, 'oldest').map((p) => p.id)).toEqual(['zoo', 'mid', 'alpha'])
  })

  test('recent falls back to name when dates equal', () => {
    const sameDate = [
      { id: 'b', name: 'b', startDate: '2025-01-01' },
      { id: 'a', name: 'a', startDate: '2025-01-01' },
    ]
    expect(sortProjects(sameDate, 'recent').map((p) => p.id)).toEqual(['a', 'b'])
  })

  test('missing startDate sorts last', () => {
    const mixed = [
      { id: 'a', name: 'a', startDate: '2025-01-01' },
      { id: 'b', name: 'b', startDate: undefined },
      { id: 'c', name: 'c', startDate: '2023-06-01' },
    ]
    expect(sortProjects(mixed, 'recent').map((p) => p.id)).toEqual(['a', 'c', 'b'])
  })
})

describe('getProjectGalleryState with sort', () => {
  const projs = [
    { id: 'z', name: 'z', categories: ['dev'], startDate: '2026-01-01' },
    { id: 'a', name: 'a', categories: ['dev'], startDate: '2024-01-01' },
    { id: 'm', name: 'm', categories: ['dev'], startDate: '2025-01-01' },
  ]
  const cats = { dev: { label: 'Dev' } }

  test('filter + sort works together', () => {
    const state = getProjectGalleryState({ projects: projs, categories: cats, filter: 'dev', sort: 'az' })
    expect(state.shown.map((p) => p.id)).toEqual(['a', 'm', 'z'])
  })

  test('all filter with az sort', () => {
    const state = getProjectGalleryState({ projects: projs, categories: cats, filter: 'all', sort: 'az' })
    expect(state.shown.map((p) => p.id)).toEqual(['a', 'm', 'z'])
  })

  test('recent + filter works together', () => {
    const state = getProjectGalleryState({ projects: projs, categories: cats, filter: 'dev', sort: 'recent' })
    expect(state.shown.map((p) => p.id)).toEqual(['z', 'm', 'a'])
  })
})
